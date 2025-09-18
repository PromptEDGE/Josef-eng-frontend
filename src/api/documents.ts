import apiClient from "@/api/client";

export type UploadProgress = {
  loaded: number;
  total?: number;
  progress: number;
};

export interface UploadProjectFileOptions {
  signal?: AbortSignal;
  onProgress?: (progress: UploadProgress) => void;
  metadata?: Record<string, string | Blob>;
}

export const uploadProjectFile = async (
  projId: string,
  file: File,
  { signal, onProgress, metadata }: UploadProjectFileOptions = {}
) => {
  const formData = new FormData();
  formData.append("files", file);
  formData.append("file_name", file.name);
  formData.append("mime_type", file.type);

  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await apiClient.post(
    `/api/v1/projects/${projId}/uploads`,
    formData,
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
