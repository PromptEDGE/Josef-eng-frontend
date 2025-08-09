import { RootState } from "@/lib/redux/store";
import { CreateProjectType } from "@/utils/types";
import axios from "axios";


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
      'https://backend-service-production-c674.up.railway.app/api/v1/projects',
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

    console.log('Project created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Project creation failed:', error.response?.data || error.message);
    throw error;
  }
};


export const getProjects = async (id:string) => {
  try {
    if(!id) return
    const response = await axios.get(
      "https://backend-service-production-c674.up.railway.app/api/v1/projects",
      {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${id}`
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