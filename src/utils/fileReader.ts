import { logger } from "@/utils/logger";
export const getFileReaderUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string); // base64 URL
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getFileReaderUrls = (files: File[]): Promise<string[]> => {
  return Promise.all(files.map((file) => getFileReaderUrl(file)));
};