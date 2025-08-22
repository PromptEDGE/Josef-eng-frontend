import { SignInFormType, SignupFormType } from '@/utils/types';
import axios from 'axios';

export const signUpUser = async ({ email, password, firstName: first_name, lastName:last_name }:SignupFormType) => {
  try {
    const response = await axios.post(
      'https://backend-service-production-c674.up.railway.app/api/v1/auth/signup',
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
export const signInUser = async ({ email, password }:SignInFormType) => {
  try {
    const response = await axios.post(
      'https://backend-service-production-c674.up.railway.app/api/v1/auth/signin',
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
      "https://backend-service-production-c674.up.railway.app/api/v1/auth/forgot-password",
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

export async function getUser(id:string) {
  try {
    if(!id) throw  new Error("UnAuthorized")
    const response = await axios.get(
      'https://backend-service-production-c674.up.railway.app/api/v1/auth/me',
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${id}`
        }
      }
    );
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}