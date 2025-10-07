import { configureStore } from "@reduxjs/toolkit";
import project from "./slice/projectSlice";
import projectDetail from "./slice/projectDetailSlice";
import library from "./slice/librarySlice";
import proposal from "./slice/proposalSlice";
import activities from "./slice/activitySlice";
import localStorage from "./slice/localStorageSlice";
import user from "./slice/userSlice";
import settings from "./slice/settingsSlice";
import { loadPersistedState, savePersistedState } from "./persistState";

const persistedState = loadPersistedState();

export const store = configureStore({
  reducer: {
    project,
    projectDetail,
    library,
    proposal,
    activites: activities,
    localStorage,
    user,
    settings,
  },
  preloadedState: persistedState,
});

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
store.subscribe(() => {
  if (typeof window === "undefined") return;
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    savePersistedState(store.getState());
  }, 300);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
