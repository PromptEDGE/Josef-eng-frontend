import { setUser } from "@/lib/redux/slice/localStorageSlice";
import { SignInFormType, User } from "@/utils/types";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { signInUser } from "@/api/auth";
import { getUser } from "@/lib/redux/slice/userSlice";

const useSignin = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { toast } = useToast();
    const {mutate, data, isPending} = useMutation({
        mutationFn: (form:SignInFormType) => signInUser(form),
        onSuccess: (data) => {
        dispatch(setUser(data));
        dispatch(getUser(data));
        navigate("/")
        toast({
            title: "SignIn successful",
            description: "You have successfully signed up.",
        });
        },
        onError: (error) => {
        toast({
            title: "SignIn failed",
            description: error.message,
            variant: "destructive",
        });
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