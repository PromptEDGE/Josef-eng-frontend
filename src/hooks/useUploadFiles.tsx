import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageType,
  UploadFileRequestOptions,
  uploadGeneralFile,
  uploadProjectFile,
  uploadStatus,
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
        updateUpload(task.id, { status: "uploading", progress:12, startedAt });

        try {
          const data = projectId
            ? 
            await uploadProjectFile(projectId, task.file, task.messageType,
               {
                signal: controller.signal,
                metadata,
                // onProgress: () => {
                //   updateUpload(task.id, { progress: 60 });
                // },
              }
            )
            : await uploadGeneralFile(task.file, task.messageType, 
              {
                signal: controller.signal,
                metadata,
                // onProgress: () => {
                //   updateUpload(task.id, { progress: 90 });
                // },
              }
            );
            const fileData= data
            const interval = setInterval(async ()=>{
              await checkStatus(fileData?.[0].task,{
                 onSuccess: (data)=>{
                   updateUpload(task.id, {
                     status: data.status==="SUCCESS"?"success":data.status==="PENDING"?"uploading":"error",
                     progress: data.status==="SUCCESS"?100:data.status==="PENDING"?60:0,
                     data,
                     completedAt: Date.now(),
                   });
                   if(data.status==="SUCCESS"){
                     clearInterval(interval)
                   }
                 },
                 onError: (error)=>{
                  clearInterval(interval)
                   updateUpload(task.id, {
                     status: "error",
                     progress: 0,
                     error: errorMessageFrom(error),
                     completedAt: Date.now(),
                   });
                   console.log(error)
                 }
               })
            },1000)
  
        } catch (error) {
          const aborted = controller.signal.aborted;
          const status: UploadStatus = aborted ? "canceled" : "error";

          updateUpload(task.id, {
            status,
            error: aborted ? "Upload canceled" : errorMessageFrom(error),
            completedAt: Date.now(),
            progress: 0,
          });
        } finally {
          controllersRef.current.delete(task.id);
        }
      }
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
