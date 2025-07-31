import { configureStore } from "@reduxjs/toolkit";
import project from "./slice/projectSlice"
import library from "./slice/librarySlice"
import proposal from "./slice/proposalSlice"
import activities from "./slice/activitySlice"
export const store = configureStore({
    reducer: {
        project: project,
        library: library,
        proposal:proposal,
        activites: activities,
    }
})
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;