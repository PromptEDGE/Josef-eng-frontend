import { logger } from "@/utils/logger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageType,
  UploadFileRequestOptions,
  uploadGeneralFile,
  uploadProjectFile,
  uploadStatus,
  cancelUpload as cancelUploadApi,
} from "@/api/documents";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from "@tanstack/react-query";

export type UploadStatus = "queued" | "uploading" | "success" | "error" | "canceled";

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  messageType: MessageType;
  error?: string;
  data?: unknown;
  startedAt?: number;
  completedAt?: number;
}

const MAX_CONCURRENT_UPLOADS = 1;
const STATUS_POLL_INTERVAL_MS = 1000;

const errorMessageFrom = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Failed to upload file";
};

interface UploadFilesArgs {
  files: File[];
  projectId?: string;
  metadata?: Record<string, string | Blob>;
  messageTypeResolver?: (file: File) => MessageType;
}




const useUploadFiles = () => {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const controllersRef = useRef(new Map<string, AbortController>());
  const isMountedRef = useRef(true);


  const updateUpload = useCallback((id: string, patch: Partial<UploadTask>) => {
    setUploads((prev) =>
      prev.map((upload) => (upload.id === id ? { ...upload, ...patch } : upload))
    );
  }, []);
  // upload user file
  const { mutate:UserUploads } = useMutation({
    mutationFn: ({projectId, file, messageType,options}:
      {projectId:string, file:File, messageType:MessageType, options?: UploadFileRequestOptions}) => 
      uploadProjectFile(projectId, file, messageType,options),
  })

  // check upload status
  const { mutateAsync:checkStatus } = useMutation({
    mutationFn: (id:string) => uploadStatus(id),
  })

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      controllersRef.current.forEach((controller) => controller.abort());
      controllersRef.current.clear();
    };
  }, []);


  const removeUpload = useCallback((id: string) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  }, []);

  const cancelUpload = useCallback((id: string) => {
    const task = uploads.find(u => u.id === id);
    if (!task) return;

    // Confirmation dialog for uploads that have progress
    if (task.progress > 10) {
      const confirmed = window.confirm(
        `Are you sure you want to cancel "${task.file.name}"? This will delete the partially uploaded file.`
      );
      if (!confirmed) return;
    }

    // Abort the upload
    const controller = controllersRef.current.get(id);
    if (controller) {
      controller.abort();
      controllersRef.current.delete(id);
    }

    // Call backend cancellation if task has started
    if (task.data && typeof task.data === 'object' && 'task' in task.data) {
      const taskId = (task.data as any).task;
      if (taskId) {
        cancelUploadApi(taskId).catch(err => {
          console.error("Failed to cancel upload on backend:", err);
        });
      }
    }

    updateUpload(id, {
      status: "canceled",
      completedAt: Date.now(),
      progress: 0,
      error: "Upload canceled"
    });
  }, [uploads, updateUpload]);

  const resetUploads = useCallback(() => {
    controllersRef.current.forEach((controller) => controller.abort());
    controllersRef.current.clear();
    setUploads([]);
  }, []);

  const uploadFiles = useCallback(
    async ({ files, projectId, metadata, messageTypeResolver }: UploadFilesArgs) => {
      if (!files.length) return [] as UploadTask[];

      const inferType = (file: File): MessageType => {
        if (file.type.startsWith("video")) return "VIDEO";
        if (file.type.startsWith("audio")) return "AUDIO";
        if (file.type.startsWith("image")) return "IMAGE";
        return "DOCUMENT";
      };

      const resolveMessageType = messageTypeResolver ?? inferType;

      const queuedTasks: UploadTask[] = files.map((file) => ({
        id: uuidv4(),
        file,
        progress: 0,
        status: "queued",
        messageType: resolveMessageType(file),
      }));
      setUploads((prev) => [...prev, ...queuedTasks]);

      const processTask = async (task: UploadTask) => {
        if (!isMountedRef.current || controllersRef.current.has(task.id)) {
          return;
        }

        const controller = new AbortController();
        controllersRef.current.set(task.id, controller);

        const startedAt = Date.now();
        updateUpload(task.id, { status: "uploading", progress: 12, startedAt });

        try {
          const data = projectId
            ? await uploadProjectFile(projectId, task.file, task.messageType, {
                signal: controller.signal,
                metadata,
              })
            : await uploadGeneralFile(task.file, task.messageType, {
                signal: controller.signal,
                metadata,
              });

          const taskId = data?.[0]?.task;
          if (!taskId) {
            throw new Error("Upload task id missing from server response");
          }

          // Poll Celery status until the task reaches terminal state.
          while (isMountedRef.current && !controller.signal.aborted) {
            const statusData = await checkStatus(taskId);
            const state = statusData?.status;
            const isSuccess = state === "SUCCESS";
            const isFailed = state === "FAILURE";

            updateUpload(task.id, {
              status: isSuccess ? "success" : isFailed ? "error" : "uploading",
              progress: isSuccess ? 100 : isFailed ? 0 : 60,
              data: statusData,
              completedAt: isSuccess || isFailed ? Date.now() : undefined,
              error: isFailed ? (statusData?.result || "Processing failed") : undefined,
            });

            if (isSuccess || isFailed) {
              break;
            }

            await new Promise((resolve) => setTimeout(resolve, STATUS_POLL_INTERVAL_MS));
          }
        } catch (error) {
          const aborted = controller.signal.aborted;
          const status: UploadStatus = aborted ? "canceled" : "error";

          updateUpload(task.id, {
            status,
            error: aborted ? "Upload canceled" : errorMessageFrom(error),
            completedAt: Date.now(),
            progress: 0,
          });
          logger.debug(error);
        } finally {
          controllersRef.current.delete(task.id);
        }
      };

      const queue = [...queuedTasks];
      const workerCount = Math.min(MAX_CONCURRENT_UPLOADS, queue.length);
      const workers = Array.from({ length: workerCount }, async () => {
        while (isMountedRef.current && queue.length) {
          const nextTask = queue.shift();
          if (!nextTask) {
            break;
          }
          await processTask(nextTask);
        }
      });

      await Promise.all(workers);
      return queuedTasks;
    },
    [updateUpload,checkStatus]
  );

  const isUploading = useMemo(
    () => uploads.some((upload) => upload.status === "uploading" || upload.status === "queued"),
    [uploads]
  );

  const hasErrors = useMemo(
    () => uploads.some((upload) => upload.status === "error"),
    [uploads]
  );

  const retryUpload = useCallback((id: string) => {
    const task = uploads.find(u => u.id === id);
    if (!task || task.status !== 'error') return;

    // Reset task to queued state
    updateUpload(id, {
      status: 'queued',
      progress: 0,
      error: undefined,
      startedAt: undefined,
      completedAt: undefined,
    });

    // Trigger upload by calling uploadFiles with the single file
    uploadFiles({ files: [task.file], messageTypeResolver: () => task.messageType });
  }, [uploads, updateUpload, uploadFiles]);

  // update upload array for ui
  const clearUploads = ()=>{
    setUploads([]);
  }

  return {
    uploads,
    isUploading,
    hasErrors,
    uploadFiles,
    cancelUpload,
    removeUpload,
    resetUploads,
    clearUploads,
    retryUpload,
  };
};

export default useUploadFiles;
