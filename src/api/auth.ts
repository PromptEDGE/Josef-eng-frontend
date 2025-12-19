import { logger } from "@/utils/logger";
import { SignInFormType, SignupFormType, User } from '@/utils/types';
import apiClient from '@/api/client';

export const signUpUser = async ({ email, password, firstName: first_name, lastName: last_name }: SignupFormType) => {
  try {
    const response = await apiClient.post(
      '/api/v1/auth/signup',
      {
        email,
        password,
        first_name,
        last_name
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const signInUser = async ({ email, password }: SignInFormType): Promise<User> => {
  try {
    const response = await apiClient.post(
      '/api/v1/auth/signin',
      {
        email,
        password
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    const response = await apiClient.post('/api/v1/auth/signout');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const forgotPassword = async ({ email }: { email: string }) => {
  try {
    const response = await apiClient.post(
      '/api/v1/auth/forgot-password',
      { email }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export async function getUser() {
  try {
    // Cookie automatically attached by apiClient (withCredentials: true)
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  job_title?: string;
  phone?: string;
  company?: string;
  location?: string;
  bio?: string;
  theme?: string;
  language?: string;
  timezone?: string;
  notification_email?: boolean;
  push?: boolean;
  sound?: boolean;
}

export async function updateProfile(data: UpdateProfileData) {
  try {
    const response = await apiClient.put('/api/v1/auth/profile/update/', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}
