import { storage } from "@/utils/localStorage";
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
            storage("user",action.payload)
        },
        loadUser: (state) => {
            // Save user data to localStorage
            const storedUser = storage("user");
            state.user = storedUser||null
          },
    }
})
export const {getUser,loadUser} = userSlice.actions;
export default userSlice.reducer;