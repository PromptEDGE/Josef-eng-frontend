import axios from "axios";
const url = import.meta.env.VITE_BACKEND_URL

export const uploadDocument = async ({type,file,projId,access_token}:{projId:string,access_token:string,type:"IMAGE"|"VIDEO"|"AUDIO"|"DOCUMENT",file:File}) => {
  try {
    const formData = new FormData();
    formData.append("message_type", type);
    formData.append("files", file);

    const res = await axios.post(
      `${url}/api/v1/projects/${projId}/uploads`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          "Authorization": `Bearer ${access_token}`
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Upload failed:", err);
  }
};
