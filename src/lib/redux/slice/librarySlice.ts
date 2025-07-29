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
            const update = [...state.library,action.payload]
            state.library = update
        },
        loadLibrary: (state)=>{
            const stored=localStorage.getItem("library")
            state.library = stored ? JSON.parse(stored) : [];

        }
    }
})
export const { getFile } = librarySlice.actions
export default librarySlice.reducer 