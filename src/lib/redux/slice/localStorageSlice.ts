import { logger } from "@/utils/logger";
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
        // Load auth payload from localStorage
        const storedAuth: User = storage("auth");
        if (storedAuth) {
          state.user = storedAuth;
        }
      },
      setUser: (state, action:PayloadAction<User>) => {
        // Set user data in state and persist to localStorage
        const user = action.payload;
        state.user = user;
        storage("auth", user);
      },
      clearUser: (state) => {
        state.user = null;
      }
    },
  });
export const { setUser,loadUser, clearUser } = localStorageSlice.actions;
export default localStorageSlice.reducer;
