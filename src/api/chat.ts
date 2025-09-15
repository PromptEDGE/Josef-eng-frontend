import axios from "axios";

const url = import.meta.env.VITE_BACKEND_URL

export const sendMessageToProject = async ({id, access, message}:{id:string, access:string, message:string}) => {
  try {
    if(!id||!access) return
    const response = await axios.post(
      `${url}/api/v1/projects/${id}/chat`,
      {
        prompt: message
      },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access}`
        },
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