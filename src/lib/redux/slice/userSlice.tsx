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
            // DEPRECATED: No-op to prevent infinite loops
            // State is now hydrated from preloadedState via persistState.ts
            // This reducer exists for backwards compatibility only
          },
    }
})
export const {getUser, clearUser} = userSlice.actions;
export default userSlice.reducer;
