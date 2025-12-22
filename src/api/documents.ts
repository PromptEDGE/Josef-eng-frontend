import { logger } from "@/utils/logger";
import apiClient from "@/api/client";

export type UploadProgress = {
  loaded: number;
  total?: number;
  progress: number;
};

export type MessageType = "DOCUMENT" | "IMAGE" | "VIDEO" | "AUDIO";

export interface UploadFileRequestOptions {
  signal?: AbortSignal;
  onProgress?: (progress: UploadProgress) => void;
  metadata?: Record<string, string | Blob>;
}

const createFormData = (
  file: File,
  messageType: MessageType,
  metadata?: Record<string, string | Blob>
) => {
  const formData = new FormData();
  formData.append("files", file);
  formData.append("file_name", file.name);
  formData.append("mime_type", file.type);
  formData.append("message_type", messageType);

  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  return formData;
};

const postMultipart = async (
  url: string,
  file: File,
  messageType: MessageType,
  { signal, onProgress, metadata }: UploadFileRequestOptions = {}
) => {
  const response = await apiClient.post(
    url,
    createFormData(file, messageType, metadata),
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
      onUploadProgress: (event) => {
        if (!onProgress) return;
        const total = event.total ?? file.size;
        const progress = total ? Math.round((event.loaded / total) * 100) : 0;
        onProgress({ loaded: event.loaded, total, progress });
      },
    }
  );
  return response.data;
};

export const uploadStatus = async (taskId: string) => {
  const res = await apiClient.post(`/api/v1/projects/upload/status`,{ task_id: taskId });
  return res.data;
};


export const uploadProjectFile = (
  projId: string,
  file: File,
  messageType: MessageType,
  options?: UploadFileRequestOptions
) => postMultipart(`/api/v1/projects/${projId}/uploads`, file, messageType, options);

export const uploadGeneralFile = (
  file: File,
  messageType: MessageType,
  options?: UploadFileRequestOptions
) => postMultipart(`/api/v1/uploads`, file, messageType, options);

export interface DocumentRecord {
  id: string;
  project_id?: string | null;
  user_id?: string | null;
  filename: string;
  content_type: string;
  storage_path?: string | null;
  status?: string;
  created_at: string;
  updated_at?: string;
  size_bytes?: number;
}

export const listDocuments = async (): Promise<DocumentRecord[]> => {
  const response = await apiClient.get<DocumentRecord[]>(`/api/v1/documents`);
  return response.data;
};

export interface DocumentDownloadResponse {
  id: string;
  filename: string;
  content_type: string;
  download_url: string;
  expires_in: number;
}

export const getDocumentDownloadUrl = async (
  documentId: string
): Promise<DocumentDownloadResponse> => {
  const response = await apiClient.get<DocumentDownloadResponse>(
    `/api/v1/documents/${documentId}/download`
  );
  return response.data;
};

// ============================================================================
// SSE PROGRESS TRACKING
// ============================================================================

export interface SSEUploadProgress {
  stage:
    | "queued"
    | "initializing"
    | "uploading"
    | "downloading"
    | "processing"
    | "extracting"
    | "embedding"
    | "storing"
    | "finalizing"
    | "complete"
    | "failed"
    | "cancelled"
    | "error";
  progress: number; // 0-100
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  error?: string;
  result?: any;
}

export interface CleanupResults {
  s3_deleted: boolean;
  db_deleted: boolean;
  errors: string[];
}

/**
 * Subscribe to real-time upload progress via Server-Sent Events.
 *
 * @param taskId - Celery task ID from upload response
 * @param onProgress - Callback for progress updates
 * @param onComplete - Callback when upload completes successfully
 * @param onError - Callback when upload fails
 * @returns EventSource instance (call .close() to stop listening)
 *
 * @example
 * const eventSource = subscribeToUploadProgress(
 *   taskId,
 *   (progress) => setProgress(progress.progress),
 *   () => console.log('Upload complete!'),
 *   (error) => console.error('Upload failed:', error)
 * );
 *
 * // Later, to stop listening:
 * eventSource.close();
 */
export const subscribeToUploadProgress = (
  taskId: string,
  onProgress: (progress: SSEUploadProgress) => void,
  onComplete: () => void,
  onError: (error: string) => void
): EventSource => {
  const baseUrl = apiClient.defaults.baseURL || "";
  const url = `${baseUrl}/api/v1/documents/${taskId}/progress`;

  logger.info("Subscribing to SSE progress", { taskId, url });

  const eventSource = new EventSource(url, {
    withCredentials: true, // Include cookies for authentication
  });

  eventSource.onmessage = (event) => {
    try {
      const progress: SSEUploadProgress = JSON.parse(event.data);

      logger.debug("SSE progress update", { taskId, progress });

      // Call progress callback
      onProgress(progress);

      // Check for terminal states
      if (progress.stage === "complete") {
        logger.info("Upload completed", { taskId });
        eventSource.close();
        onComplete();
      } else if (progress.stage === "failed") {
        logger.error("Upload failed", { taskId, error: progress.error });
        eventSource.close();
        onError(progress.error || "Upload failed");
      } else if (progress.stage === "cancelled") {
        logger.warn("Upload cancelled", { taskId });
        eventSource.close();
        onError("Upload was cancelled");
      } else if (progress.stage === "error") {
        logger.error("SSE error", { taskId, error: progress.error });
        eventSource.close();
        onError(progress.error || "Internal error");
      }
    } catch (err) {
      logger.error("Failed to parse SSE event", { taskId, error: err });
      eventSource.close();
      onError("Failed to parse progress update");
    }
  };

  eventSource.onerror = (error) => {
    logger.error("SSE connection error", { taskId, error });
    eventSource.close();
    onError("Connection to server lost");
  };

  // Automatically close after 30 minutes (timeout)
  setTimeout(() => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      logger.warn("SSE connection timeout after 30 minutes", { taskId });
      eventSource.close();
      onError("Upload timeout - please try again");
    }
  }, 30 * 60 * 1000);

  return eventSource;
};

/**
 * Cancel an in-progress upload.
 *
 * This will:
 * - Stop the Celery task
 * - Delete the file from S3
 * - Delete the database record
 *
 * @param taskId - Celery task ID from upload response
 * @returns Cleanup results
 *
 * @example
 * try {
 *   const result = await cancelUpload(taskId);
 *   console.log('Upload cancelled:', result);
 * } catch (error) {
 *   console.error('Failed to cancel:', error);
 * }
 */
export const cancelUpload = async (
  taskId: string
): Promise<{
  task_id: string;
  document_id: string;
  status: string;
  cleanup_results: CleanupResults;
}> => {
  logger.info("Cancelling upload", { taskId });

  const response = await apiClient.post(`/api/v1/documents/${taskId}/cancel`);

  logger.info("Upload cancelled successfully", {
    taskId,
    result: response.data,
  });

  return response.data;
};

/**
 * Manually cleanup a failed upload.
 *
 * Use this to remove failed uploads from the UI and clean up resources.
 *
 * @param documentId - Document UUID
 * @returns Cleanup results
 *
 * @example
 * try {
 *   const result = await cleanupFailedUpload(documentId);
 *   console.log('Cleanup complete:', result);
 * } catch (error) {
 *   console.error('Cleanup failed:', error);
 * }
 */
export const cleanupFailedUpload = async (
  documentId: string
): Promise<{
  document_id: string;
  cleanup_results: CleanupResults;
}> => {
  logger.info("Cleaning up failed upload", { documentId });

  const response = await apiClient.delete(
    `/api/v1/documents/${documentId}/cleanup`
  );

  logger.info("Cleanup completed", {
    documentId,
    result: response.data,
  });

  return response.data;
};
