import { logger } from "@/utils/logger";
import { signUpUser } from '../api/auth';
import { useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { SignupFormType } from '@/utils/types';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';



export function useSignup() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
    const {mutate, data, isPending} = useMutation({
      mutationFn: (form:SignupFormType) => signUpUser(form),
      onSuccess: async (data) => {
        toast({
          title: "Signup successful",
          description: data.detail,
        });
        navigate("/signin")
      },
      onError: (error) => {
        toast({
          title: "Signup failed",
          description: error.message||"An error occurred during signup.",
          variant: "destructive",
        });
    }
});
const handleSignup = async (data: SignupFormType) => {
    try {
        await mutate(data);
    } catch (err: any) {
        toast({
          title: "Signup failed",
          description: "An error occurred during signup.",
          variant: "destructive",
        });
    }
  };

  return {
    handleSignup,
    data,
    isPending
  };
}
