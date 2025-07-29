import { configureStore } from "@reduxjs/toolkit";
import project from "./slice/projectSlice"
import library from "./slice/librarySlice"
export const store = configureStore({
    reducer: {
        project: project,
        library: library,
    }
})
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;