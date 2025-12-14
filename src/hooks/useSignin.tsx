import { logger } from "@/utils/logger";
import { setUser } from "@/lib/redux/slice/localStorageSlice";
import { SignInFormType, User } from "@/utils/types";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { signInUser } from "@/api/auth";
import { getUser } from "@/lib/redux/slice/userSlice";
import { isAxiosError } from "axios";

const useSignin = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { toast } = useToast();
    const {mutate, data, isPending} = useMutation<User, any, SignInFormType>({
        mutationFn: (form:SignInFormType) => signInUser(form),
        onSuccess: (data) => {
        // Tokens are now stored in httpOnly cookies by the backend
        // Persist entire auth payload if needed elsewhere
        dispatch(setUser(data));
        // Store only user details in user slice
        dispatch(getUser(data.user));
        logger.debug(data)
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
