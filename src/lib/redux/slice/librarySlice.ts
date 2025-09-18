import { LibraryItem } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit";

interface Library{
    library: LibraryItem[]
}
const initialState:Library ={
    library: []
}
const librarySlice = createSlice({
    name:"library",
    initialState,
    reducers:{
        getFile: (state,action:PayloadAction<LibraryItem>)=>{
            const existingIndex = state.library.findIndex((item) => item.id === action.payload.id);
            if (existingIndex >= 0) {
                state.library[existingIndex] = action.payload;
            } else {
                state.library.push(action.payload);
            }
        },
        loadLibrary: (state)=>{
            const stored=localStorage.getItem("library")
            if (!stored) return;
            try {
                const parsed: LibraryItem[] = JSON.parse(stored).map((item: LibraryItem) => ({
                    ...item,
                    uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
                }));
                state.library = parsed;
            } catch (error) {
                console.error('Failed to load library from storage', error);
            }

        },
        getAllLibrary: (state,action:PayloadAction<LibraryItem[]>)=>{
            state.library = action.payload
        }
    }
})
export const { getFile,getAllLibrary } = librarySlice.actions
export default librarySlice.reducer 
