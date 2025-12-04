import { logger } from "@/utils/logger";
import apiClient from "@/api/client";

export interface UploadedFileData {
  filename: string;
  file_type: string;
  full_content: string;
}

export const sendMessageToProject = async ({
  id,
  message,
  uploadedFiles
}: {
  id: string;
  message: string;
  uploadedFiles?: UploadedFileData[];
}) => {
  try {
    if (!id) {
      logger.error("Project ID is required");
      throw new Error("Project ID is required");
    }

    const response = await apiClient.post(
      `/api/v1/projects/${id}/chat`,
      {
        prompt: message,
        uploaded_files: uploadedFiles || []
      }
    );

    return response.data;
  } catch (error: any) {
    logger.error("Error sending message to project", error);
    throw error;
  }
};
