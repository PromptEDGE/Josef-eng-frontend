import { logger } from "@/utils/logger";
import { CreateProjectType, ProjectData } from "@/utils/types";
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
    logger.error('Project creation failed:', error.response?.data || error.message);
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
    logger.error(
      "Error fetching projects:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export interface ProjectHistoryEntry {
  id?: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp?: string;
  sources?: Array<{ source: string; metadata?: Record<string, unknown> }>;
}

export interface ProjectDetailResponse {
  project: {
    id: string;
    name: string;
    client: string;
    type: string;
    priority: string;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    start_date?: string;
    end_date?: string;
    budget?: string;
    location?: string;
    description?: string;
    systems?: string[];
  };
  chat_history?: ProjectHistoryEntry[];
  documents?: Array<{
    id: string;
    filename: string;
    storage_path?: string;
    content_type?: string;
    created_at?: string;
  }>;
}

const PROJECT_TYPES: ProjectData['type'][] = ['Commercial', 'Industrial', 'Residential', 'Institutional'];
const PROJECT_PRIORITIES: ProjectData['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];

const normalizeProjectType = (value?: string): ProjectData['type'] => {
  if (!value) return 'Commercial';
  const upper = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  return PROJECT_TYPES.includes(upper as ProjectData['type']) ? (upper as ProjectData['type']) : 'Commercial';
};

const normalizeProjectPriority = (value?: string): ProjectData['priority'] => {
  if (!value) return 'Medium';
  const formatted = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  return PROJECT_PRIORITIES.includes(formatted as ProjectData['priority'])
    ? (formatted as ProjectData['priority'])
    : 'Medium';
};

const toProjectData = (payload: ProjectDetailResponse['project']): ProjectData => {
  return {
    id: payload.id,
    name: payload.name,
    client: payload.client,
    type: normalizeProjectType(payload.type),
    priority: normalizeProjectPriority(payload.priority),
    startDate: payload.start_date ? new Date(payload.start_date) : undefined,
    endDate: payload.end_date ? new Date(payload.end_date) : undefined,
    budget: payload.budget ?? '',
    location: payload.location ?? '',
    description: payload.description ?? '',
    systems: payload.systems ?? [],
    user_id: payload.user_id ?? '',
    created_at: payload.created_at ?? payload.start_date ?? new Date().toISOString(),
    updated_at: payload.updated_at ?? payload.end_date ?? new Date().toISOString(),
  };
};

export const getProjectDetails = async (projectId: string): Promise<{
  project: ProjectData;
  chat_history: ProjectHistoryEntry[];
  documents?: ProjectDetailResponse['documents'];
}> => {
  const response = await apiClient.get<ProjectDetailResponse>(
    `/api/v1/projects/${projectId}`
  );

  const { project, chat_history = [], documents } = response.data;

  return {
    project: toProjectData(project),
    chat_history,
    documents,
  };
};
