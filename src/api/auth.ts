import { SignInFormType, SignupFormType, User } from '@/utils/types';
import axios from 'axios';
import apiClient from '@/api/client';
const url = import.meta.env.VITE_BACKEND_URL as string;
export const signUpUser = async ({ email, password, firstName: first_name, lastName:last_name }:SignupFormType) => {
  try {
    const response = await axios.post(
      `${url}/api/v1/auth/signup`,
      {
        email,
        password,
        first_name,
        last_name
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Signup failed:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
export const signInUser = async ({ email, password }:SignInFormType): Promise<User> => {
  try {
    const response = await axios.post(
      `${url}/api/v1/auth/signin`,
      {
        email,
        password
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Signin failed:', error.response?.data || error.message);
    throw error;
  }
};

export const forgotPassword = async ({email, access}:{email:string,access:string}) => {
  try {
    const response = await axios.post(
      `${url}/api/v1/auth/forgot-password`,
      {
        email
      },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
};

export async function getUser(token: string) {
  try {
    if (!token) throw new Error("UnAuthorized");
    const response = await apiClient.get(`/api/v1/auth/me`);
    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
}

export async function refreshAccessToken(refresh_token: string) {
  try {
    const response = await axios.post(
      `${url}/api/v1/auth/refresh`,
      { refresh_token },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data as { access_token: string; refresh_token?: string };
  } catch (error) {
    console.error('Refresh token failed:', error.response?.data || error.message);
    throw error;
  }
}
