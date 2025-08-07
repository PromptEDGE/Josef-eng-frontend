import { Message, ProjectData } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


interface Project{
    project: ProjectData[]
}

const initialState: Project = {
  project:[]
}

const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers:{
        createNew(state,action:PayloadAction<ProjectData>){
            const addtoproject = [...state.project,action.payload]
            const firstMessage:Message =     {
                id: '1',
                type: 'system',
                content: {
                    text:'Hello! I\'m your AI HVAC Engineering Assistant. I can help you with calculations, standards, design recommendations, troubleshooting, and more. What would you like to work on today?',
                },
                timestamp: new Date().toISOString(),
                category: 'general'
            }
            action.payload.conversation.push(firstMessage)
            state.project = addtoproject
          },
          updateProject: (state, action: PayloadAction<{ message: Message; uid: string }>) => {
            const uid = action.payload.uid.toLowerCase();
            const message = action.payload.message;

            const project = state.project.find(p => p.uid.toLowerCase() === uid.toLowerCase());

            if (project) {
                project.conversation.push(message);
            } else {
                console.warn(`No project found with uid: ${uid}`);
            }
        },
        // loadProject:(state)=>{
        //   const stored = localStorage.getItem("projects")
        //   const parsed = stored ? JSON.parse(stored) : [];
        //     state.project = parsed.filter((project: Pro) => project.message && project.message.length > 0)
        // }

    }
})
export const { createNew,updateProject } = projectSlice.actions;
export default projectSlice.reducer
