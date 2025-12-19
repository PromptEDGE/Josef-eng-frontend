import { logger } from "@/utils/logger";
import { SignInFormType, User } from "@/utils/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { signInUser } from "@/api/auth";
import { isAxiosError } from "axios";

const useSignin = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { toast } = useToast();
    const {mutate, data, isPending} = useMutation<User, any, SignInFormType>({
        mutationFn: (form:SignInFormType) => signInUser(form),
        onSuccess: (data) => {
        // Tokens are now stored in httpOnly cookies by the backend
        // Populate TanStack Query cache (source of truth for auth)
        queryClient.setQueryData(['auth', 'me'], data.user);

        // SUCCESS: Redux dispatches removed - they were causing infinite loops
        // TanStack Query + httpOnly cookies handle all auth state

        navigate("/")
        toast({
            title: "SignIn successful",
            description: "You have successfully signed in.",
        });
        },
        onError: (error) => {
            if(isAxiosError(error)){
                toast({
                    title: "SignIn failed",
                    description: error.response?.data.detail,
                    variant: "destructive",
                });
            }else{
                toast({
                    title: "SignIn failed",
                    description: error.message,
                    variant: "destructive",
                });
            }
        }
    });
    const handleSignin = async (data: SignInFormType) => {
        try {
            await mutate(data);
        } catch (err: any) {
            toast({
            title: "SignIn failed",
            description: "An error occurred during signin.",
            variant: "destructive",
            });
        }
    };
    return {
        handleSignin,
        data,
        isPending,
    };
}
 
export default useSignin;
