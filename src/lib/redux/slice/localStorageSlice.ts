import { storage } from "@/utils/localStorage";
import { User } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LocalStorageState {
  user: User | null;
}
const initialState: LocalStorageState = {
  user: null
};

const localStorageSlice = createSlice({
    name:"localStorage",
    initialState,
    reducers: {
      loadUser: (state) => {
        // Save user data to localStorage
        const storedUser: User = storage("user");
        if(storedUser){
          state.user =storedUser
        }
      },
      setUser: (state, action:PayloadAction<User>) => {
        // Set user data in state and localStorage
        const user = action.payload;
        state.user = user;
      }
    },
  });
export const { setUser,loadUser } = localStorageSlice.actions;
export default localStorageSlice.reducer;
