import { logger } from "@/utils/logger";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type ThemePreference = "light" | "dark" | "system";
export type LanguagePreference = "en" | "es" | "fr" | "de";

export interface UserProfileState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  location: string;
  bio: string;
  avatarUrl?: string;
}

export interface UserPreferenceState {
  theme: ThemePreference;
  language: LanguagePreference;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundNotifications: boolean;
  autoSave: boolean;
  showTips: boolean;
}

export interface SecuritySettingsState {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  passwordLastChanged: string;
  loginAlerts: boolean;
  rememberDevices: boolean;
}

interface SettingsState {
  profile: UserProfileState;
  preferences: UserPreferenceState;
  security: SecuritySettingsState;
}

const initialState: SettingsState = {
  profile: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    company: "Engineering Solutions Inc.",
    title: "Senior HVAC Engineer",
    location: "New York, NY",
    bio: "Experienced HVAC engineer specializing in commercial and industrial systems.",
    avatarUrl: undefined,
  },
  preferences: {
    theme: "light",
    language: "en",
    timezone: "UTC",
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: false,
    autoSave: true,
    showTips: true,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: "30",
    passwordLastChanged: new Date().toISOString(),
    loginAlerts: true,
    rememberDevices: true,
  },
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateProfile(state, action: PayloadAction<Partial<UserProfileState>>) {
      state.profile = { ...state.profile, ...action.payload };
    },
    setAvatar(state, action: PayloadAction<string | undefined>) {
      state.profile.avatarUrl = action.payload;
    },
    updatePreferences(state, action: PayloadAction<Partial<UserPreferenceState>>) {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    updateSecurity(state, action: PayloadAction<Partial<SecuritySettingsState>>) {
      state.security = { ...state.security, ...action.payload };
    },
    resetSettings() {
      return initialState;
    },
  },
});

export const {
  updateProfile,
  setAvatar,
  updatePreferences,
  updateSecurity,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
