import apiClient from "@/api/client";

export const sendMessageToProject = async ({id, message}:{id:string, message:string}) => {
  try {
    if(!id) return
    const response = await apiClient.post(
      `/api/v1/projects/${id}/chat`,
      {
        prompt: message
      }
    );

    return response.data;
  } catch (error) {
    console.error(  
      "Error sending message to project:",
      error.response?.data || error.message
    );
    throw error;
  }
};
