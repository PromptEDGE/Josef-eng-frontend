/**
 * Enhanced File Upload Component with:
 * - Real-time progress via SSE
 * - Upload cancellation
 * - Error handling with cleanup
 *
 * Add this to your components directory and integrate with your upload UI.
 */

import React, { useState, useCallback, useRef } from "react";
import {
  subscribeToUploadProgress,
  cancelUpload,
  cleanupFailedUpload,
  type UploadProgress,
} from "@/api/documents-enhanced";
import { uploadProjectFile } from "@/api/documents";

interface FileUploadWithProgressProps {
  projectId: string;
  onUploadComplete?: (documentId: string) => void;
  onUploadError?: (error: string) => void;
}

export const FileUploadWithProgress: React.FC<FileUploadWithProgressProps> = ({
  projectId,
  onUploadComplete,
  onUploadError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          alert("File is too large. Maximum size is 50MB.");
          return;
        }

        setSelectedFile(file);
      }
    },
    []
  );

  /**
   * Start file upload
   */
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(null);
    setTaskId(null);
    setDocumentId(null);

    try {
      // Step 1: Upload file to backend
      const response = await uploadProjectFile(projectId, selectedFile, "DOCUMENT");

      const uploadedFile = response[0]; // First file from response
      setTaskId(uploadedFile.task);
      setDocumentId(uploadedFile.document_id);

      // Step 2: Subscribe to SSE progress
      const eventSource = subscribeToUploadProgress(
        uploadedFile.task,
        (progressData) => {
          setProgress(progressData);
          console.log(
            `Upload progress: ${progressData.stage} - ${progressData.progress}%`
          );
        },
        () => {
          // Upload complete
          console.log("Upload completed successfully!");
          setUploading(false);
          onUploadComplete?.(uploadedFile.document_id);
        },
        (error) => {
          // Upload failed
          console.error("Upload failed:", error);
          setUploading(false);
          onUploadError?.(error);
        }
      );

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      onUploadError?.(error instanceof Error ? error.message : "Upload failed");
    }
  }, [selectedFile, projectId, onUploadComplete, onUploadError]);

  /**
   * Cancel upload
   */
  const handleCancel = useCallback(async () => {
    if (!taskId) return;

    try {
      // Close SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Cancel on backend
      console.log("Cancelling upload...");
      const result = await cancelUpload(taskId);

      console.log("Upload cancelled:", result);

      setUploading(false);
      setProgress(null);
      setTaskId(null);
      setDocumentId(null);
      setSelectedFile(null);

      alert("Upload cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel upload:", error);
      alert(`Failed to cancel: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [taskId]);

  /**
   * Cleanup failed upload
   */
  const handleCleanup = useCallback(async () => {
    if (!documentId) return;

    try {
      console.log("Cleaning up failed upload...");
      const result = await cleanupFailedUpload(documentId);

      console.log("Cleanup complete:", result);

      setProgress(null);
      setTaskId(null);
      setDocumentId(null);
      setSelectedFile(null);

      alert("Cleanup completed");
    } catch (error) {
      console.error("Cleanup failed:", error);
      alert(`Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [documentId]);

  /**
   * Get progress bar color based on stage
   */
  const getProgressColor = (stage: string): string => {
    switch (stage) {
      case "complete":
        return "bg-green-500";
      case "failed":
      case "cancelled":
        return "bg-red-500";
      case "processing":
      case "extracting":
      case "embedding":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  /**
   * Get user-friendly stage label
   */
  const getStageLabel = (stage: string): string => {
    const labels: Record<string, string> = {
      queued: "Queued",
      initializing: "Initializing",
      uploading: "Uploading to AI service",
      downloading: "Downloading",
      processing: "Processing",
      extracting: "Extracting content",
      embedding: "Generating embeddings",
      storing: "Storing in database",
      finalizing: "Finalizing",
      complete: "Complete",
      failed: "Failed",
      cancelled: "Cancelled",
    };

    return labels[stage] || stage;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Document</h2>

      {/* File Input */}
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.mp3,.wav,.mp4,.avi"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Upload Button */}
      {!uploading && selectedFile && (
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload File
        </button>
      )}

      {/* Progress Display */}
      {uploading && progress && (
        <div className="mt-6">
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>{getStageLabel(progress.stage)}</span>
              <span>{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor(
                  progress.stage
                )}`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>

          {/* Status Message */}
          <p className="text-sm text-gray-600 mb-4">{progress.message}</p>

          {/* Metadata (optional debug info) */}
          {progress.metadata && Object.keys(progress.metadata).length > 0 && (
            <details className="text-xs text-gray-500 mb-4">
              <summary className="cursor-pointer">Debug Info</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(progress.metadata, null, 2)}
              </pre>
            </details>
          )}

          {/* Cancel Button (only show during processing) */}
          {progress.stage !== "complete" && progress.stage !== "failed" && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Upload
            </button>
          )}

          {/* Cleanup Button (show on failure) */}
          {progress.stage === "failed" && documentId && (
            <button
              onClick={handleCleanup}
              className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clean Up
            </button>
          )}
        </div>
      )}

      {/* Error Display */}
      {progress?.stage === "failed" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Upload Failed</h3>
          <p className="text-sm text-red-700">{progress.error || "Unknown error"}</p>
        </div>
      )}

      {/* Success Display */}
      {progress?.stage === "complete" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Upload Complete!</h3>
          <p className="text-sm text-green-700">
            Your document has been successfully processed and is ready to use.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadWithProgress;
