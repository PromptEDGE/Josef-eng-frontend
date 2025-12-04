import { logger } from "@/utils/logger";
import { UserDetail } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface User{
    user: UserDetail | null
}
const initialState: User = {
    user: null
}
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers:{
        getUser: (state,action:PayloadAction<UserDetail>)=>{
            state.user = action.payload
        },
        clearUser: (state)=>{
            state.user = null
        },
        loadUser: (state) => {
            // Save user data to localStorage
            // Keeping this reducer for compatibility; prefer reading from API on app load
            state.user = state.user || null
          },
    }
})
export const {getUser, clearUser} = userSlice.actions;
export default userSlice.reducer;
