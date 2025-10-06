import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageType,
  uploadGeneralFile,
  uploadProjectFile,
} from "@/api/documents";
import { v4 as uuidv4 } from "uuid";

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

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      controllersRef.current.forEach((controller) => controller.abort());
      controllersRef.current.clear();
    };
  }, []);

  const updateUpload = useCallback((id: string, patch: Partial<UploadTask>) => {
    setUploads((prev) =>
      prev.map((upload) => (upload.id === id ? { ...upload, ...patch } : upload))
    );
  }, []);

  const removeUpload = useCallback((id: string) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  }, []);

  const cancelUpload = useCallback((id: string) => {
    const controller = controllersRef.current.get(id);
    if (controller) {
      controller.abort();
      return;
    }

    // If the upload hasn't started yet, mark it as canceled immediately
    updateUpload(id, { status: "canceled", progress: 0, error: "Upload canceled" });
  }, [updateUpload]);

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

      for (const task of queuedTasks) {
        if (!isMountedRef.current) {
          break;
        }

        if (controllersRef.current.has(task.id)) {
          continue;
        }

        const controller = new AbortController();
        controllersRef.current.set(task.id, controller);

        const startedAt = Date.now();
        updateUpload(task.id, { status: "uploading", startedAt });

        try {
          const data = projectId
            ? await uploadProjectFile(projectId, task.file, task.messageType, {
                signal: controller.signal,
                metadata,
                onProgress: ({ progress }) => {
                  updateUpload(task.id, { progress });
                },
              })
            : await uploadGeneralFile(task.file, task.messageType, {
                signal: controller.signal,
                metadata,
                onProgress: ({ progress }) => {
                  updateUpload(task.id, { progress });
                },
              });

          updateUpload(task.id, {
            status: "success",
            progress: 100,
            data,
            completedAt: Date.now(),
          });
        } catch (error) {
          const aborted = controller.signal.aborted;
          const status: UploadStatus = aborted ? "canceled" : "error";

          updateUpload(task.id, {
            status,
            error: aborted ? "Upload canceled" : errorMessageFrom(error),
            completedAt: Date.now(),
          });
        } finally {
          controllersRef.current.delete(task.id);
        }
      }
      return queuedTasks;
    },
    [updateUpload]
  );

  const isUploading = useMemo(
    () => uploads.some((upload) => upload.status === "uploading" || upload.status === "queued"),
    [uploads]
  );

  const hasErrors = useMemo(
    () => uploads.some((upload) => upload.status === "error"),
    [uploads]
  );


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
    clearUploads
  };
};

export default useUploadFiles;
