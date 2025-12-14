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
