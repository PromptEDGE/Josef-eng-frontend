/**
 * React hook for real-time upload progress tracking via SSE.
 *
 * This hook manages SSE connection lifecycle and provides progress state.
 *
 * @example
 * const { progress, isUploading, error, startTracking, cancelUpload } = useUploadProgress();
 *
 * // Start tracking after upload
 * const response = await uploadProjectFile(...);
 * startTracking(response[0].task);
 *
 * // In JSX
 * {isUploading && (
 *   <div>
 *     <progress value={progress?.progress} max="100" />
 *     <p>{progress?.message}</p>
 *     <button onClick={cancelUpload}>Cancel</button>
 *   </div>
 * )}
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  subscribeToUploadProgress,
  cancelUpload as apiCancelUpload,
  SSEUploadProgress,
} from "@/api/documents";
import { logger } from "@/utils/logger";

export interface UseUploadProgressReturn {
  /** Current progress state */
  progress: SSEUploadProgress | null;
  /** Whether upload is in progress */
  isUploading: boolean;
  /** Error message if upload failed */
  error: string | null;
  /** Task ID being tracked */
  taskId: string | null;
  /** Document ID from task metadata */
  documentId: string | null;
  /** Start tracking progress for a task */
  startTracking: (taskId: string) => void;
  /** Cancel the current upload */
  cancelUpload: () => Promise<void>;
  /** Reset state */
  reset: () => void;
}

export const useUploadProgress = (): UseUploadProgressReturn => {
  const [progress, setProgress] = useState<SSEUploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Start tracking progress for a task
   */
  const startTracking = useCallback((newTaskId: string) => {
    logger.info("Starting upload progress tracking", { taskId: newTaskId });

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Reset state
    setProgress(null);
    setError(null);
    setIsUploading(true);
    setTaskId(newTaskId);

    // Subscribe to SSE
    const eventSource = subscribeToUploadProgress(
      newTaskId,
      (progressData) => {
        setProgress(progressData);

        // Extract document ID from metadata if available
        if (progressData.metadata?.document_id) {
          setDocumentId(progressData.metadata.document_id);
        }
      },
      () => {
        // Upload complete
        logger.info("Upload completed", { taskId: newTaskId });
        setIsUploading(false);
      },
      (errorMsg) => {
        // Upload failed
        logger.error("Upload failed", { taskId: newTaskId, error: errorMsg });
        setError(errorMsg);
        setIsUploading(false);
      }
    );

    eventSourceRef.current = eventSource;
  }, []);

  /**
   * Cancel the current upload
   */
  const cancelUpload = useCallback(async () => {
    if (!taskId) {
      logger.warn("Cannot cancel: no task ID");
      return;
    }

    try {
      logger.info("Cancelling upload", { taskId });

      // Close SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Cancel on backend
      await apiCancelUpload(taskId);

      // Update state
      setIsUploading(false);
      setProgress((prev) =>
        prev
          ? { ...prev, stage: "cancelled", message: "Upload cancelled" }
          : null
      );

      logger.info("Upload cancelled successfully", { taskId });
    } catch (err) {
      logger.error("Failed to cancel upload", { taskId, error: err });
      setError(
        err instanceof Error ? err.message : "Failed to cancel upload"
      );
    }
  }, [taskId]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    logger.debug("Resetting upload progress state");

    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Reset state
    setProgress(null);
    setIsUploading(false);
    setError(null);
    setTaskId(null);
    setDocumentId(null);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        logger.debug("Cleaning up SSE connection on unmount");
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    progress,
    isUploading,
    error,
    taskId,
    documentId,
    startTracking,
    cancelUpload,
    reset,
  };
};
