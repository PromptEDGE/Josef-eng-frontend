export interface ProjectData {
  name: string;
  client: string;
  type: 'commercial' | 'industrial' | 'residential' | 'institutional' | '';
  priority: 'low' | 'medium' | 'high' | 'urgent' | '';
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: string;
  location: string;
  description: string;
  systems: string[];
  // team: string[];
  conversation: Message[]
  uid: string
}
export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: {
    text?: string;
    fileUrl?: string
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
}
export interface Proposal {
  id: string; 
  project_uid: string; 
  projectName: string;
  client: string;
  projectType: 'commercial' | 'industrial' | 'residential' | 'institutional' | '';
  priority: 'low' | 'medium' | 'high' | 'urgent' | '';
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