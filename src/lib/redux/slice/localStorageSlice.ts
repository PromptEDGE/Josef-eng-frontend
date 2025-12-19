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
        // DEPRECATED: No longer needed - state is hydrated from preloadedState
        // Keeping for backwards compatibility but this is now a no-op
        // to prevent infinite loops with store.subscribe()
      },
      setUser: (state, action:PayloadAction<User>) => {
        // Set user data in state
        // Note: localStorage persistence happens via store.subscribe() in store.ts
        const user = action.payload;
        state.user = user;
      },
      clearUser: (state) => {
        state.user = null;
      }
    },
  });
export const { setUser,loadUser, clearUser } = localStorageSlice.actions;
export default localStorageSlice.reducer;
