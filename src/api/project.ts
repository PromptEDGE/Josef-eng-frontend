import { CreateProjectType, LibraryItem } from "@/utils/types";
import axios from "axios";

const url = import.meta.env.VITE_BACKEND_URL
export const createProject = async ({
  name,
  client,
  type,
  priority,
  startDate:start_date,
  endDate:end_date,
  budget,
  location,
  description,
  systems,
  access_token
}:CreateProjectType) => {
  try {
    if(!access_token) return
    const response = await axios.post(
      `${url}/api/v1/projects`,
      {
        name,
        client,
        type,
        priority,
        start_date,
        end_date,
        budget,
        location,
        description,
        systems
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${access_token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Project creation failed:', error.response?.data || error.message);
    throw error;
  }
};


export const getProjects = async (id:string) => {
  try {
    if(!id) return
    const access_token = id
    const response = await axios.get(
      "https://backend-service-production-c674.up.railway.app/api/v1/projects",
      {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${access_token}`
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching projects:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const sendMessageToProject = async (id:string, access:string, message:string) => {
  try {
    if(!id||!access) return
    const response = await axios.post(
      `${url}/api/v1/projects/${id}/messages`,
      {
        message
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

export const getLibrary = async (access:string)=>{
  try {
    if(!access) return
    const res = await axios.get(`${url}/api/v1/library`)
    if(res.status!==200) throw new Error('Failed to fetch library')
    return res.data
    
  } catch (error) {
      console.error('Project creation failed:', error.response?.data || error.message);
  }
}


export const addToLibrary = async ({library,access}:{library:LibraryItem,access:string})=>{
  try {
    if(!access||!library) return
    const res = await axios.post(`${url}/api/v1/library`, library, {
      'headers': {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    return res.data
    
  } catch (error) {
    console.error('Project creation failed:', error.response?.data || error.message);
  }
}