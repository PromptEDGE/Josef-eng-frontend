import { logger } from "@/utils/logger";

export interface ProjectData {
  name: string;
  client: string;
  type: 'Commercial' | 'Industrial' | 'Residential' | 'Institutional';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' 
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: string;
  location: string;
  description: string;
  systems: string[];
  // conversation?: Message[]
  user_id: string
  created_at: string;
  updated_at: string;
  id: string;
}
export type CreateProjectType = {
  name: string,
  client: string,
  type: 'Commercial' | 'Industrial' | 'Residential' | 'Institutional'| '',
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | '',
  startDate: string,
  endDate: string,
  budget: string,
  location: string,
  description: string,
  systems: string[],
  // access_token removed - authentication now uses httpOnly cookies
}
export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: {
    text?: string;
    fileUrl?: string;
    filename?: string;
  };
  timestamp: string;
  attachments?: string[];
  category?: 'calculation' | 'standard' | 'design' | 'troubleshooting' | 'general';
  confidence?: number;
}
export interface LibraryItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'document';
  size: string;
  duration?: string;
//   uploadedBy: string;
  uploadedAt: Date;
  lastAccessed?: Date;
  tags: string[];
  description?: string;
  thumbnail?: string;
  projectId?: string | null;
  userId?: string | null;
  status?: string;
  storagePath?: string | null;
  contentType?: string;
  downloadUrl?: string;
}
export interface Proposal {
  id: string; 
  project_uid: string; 
  projectName: string;
  client: string;
  projectType: 'Commercial' | 'Industrial' | 'Residential' | 'Institutional' | '';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | '';
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: string;
  location: string;
  description: string;
  systems: string[];
  createdAt: string;
  conversation: string; // Discussion history for this proposal,
  pdf?: {
    name: string,
    file: Blob,
    url: string
  }
}


export interface ActivityItem {
  id: string;
  type: 'document' | 'image' | 'video' | 'other'; // you can expand these as needed
  title: string;
  time: string;
  // status: 'completed' | 'pending' | 'in-progress'; // add more statuses if needed
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export type SignupFormType = {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
};
export type SignInFormType = {
  email: string,  
  password: string,
};

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  theme: string;
  language: string;
  timezone: string;
  notification_email: boolean;
  push: boolean;
  sound: boolean;
  bio: string | null;
  phone: string | null;
  company: string | null;
  location: string | null;
  job_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDetail {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

export interface User  {
  // User with nested profile (returned by /me endpoint)
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  profile: UserProfile;

  // DEPRECATED: Tokens are now stored in httpOnly cookies
  // These fields are kept for backward compatibility with old signin responses
  access_token?: string;
  refresh_token?: string;
  token_type?: string; // usually "bearer"
  user?: UserDetail; // Legacy signin response format
}
