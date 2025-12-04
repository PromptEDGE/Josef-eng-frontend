import { logger } from "@/utils/logger";
import { Message, ProjectData } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ProjectId = string;

interface ProjectDetailState {
  details: Record<ProjectId, ProjectData>;
  chats: Record<ProjectId, Message[]>;
}

const initialState: ProjectDetailState = {
  details: {},
  chats: {},
};

const projectDetailSlice = createSlice({
  name: "projectDetail",
  initialState,
  reducers: {
    setProjectDetail(state, action: PayloadAction<{ projectId: string; detail: ProjectData }>) {
      const { projectId, detail } = action.payload;
      state.details[projectId] = detail;
    },
    setProjectChat(state, action: PayloadAction<{ projectId: string; messages: Message[] }>) {
      const { projectId, messages } = action.payload;
      state.chats[projectId] = messages;
    },
    appendProjectMessage(state, action: PayloadAction<{ projectId: string; message: Message }>) {
      const { projectId, message } = action.payload;
      const existing = state.chats[projectId] ?? [];
      state.chats[projectId] = [...existing, message];
    },
    clearProject(state, action: PayloadAction<string>) {
      const projectId = action.payload;
      delete state.details[projectId];
      delete state.chats[projectId];
    },
  },
});

export const {
  setProjectDetail,
  setProjectChat,
  appendProjectMessage,
  clearProject,
} = projectDetailSlice.actions;

export default projectDetailSlice.reducer;
