import { CreateProjectType } from "@/utils/types";
import apiClient from "@/api/client";
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
}:CreateProjectType) => {
  try {
    const response = await apiClient.post(
      `/api/v1/projects`,
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
      }
    );

    return response.data;
  } catch (error) {
    console.error('Project creation failed:', error.response?.data || error.message);
    throw error;
  }
};


export const getProjects = async () => {
  try {
    const response = await apiClient.get(
      `/api/v1/projects`
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
