import { logger } from "@/utils/logger";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { forgotPassword } from "@/api/auth";

const useForgottenPassword = () => {
    const { toast } = useToast()
    const {mutate,isPending,isSuccess,error} = useMutation({
        mutationFn: ({email}:{email:string})=> forgotPassword({email}),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Password reset link sent to your email.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to send reset link.",
                variant: "destructive",
            });
        }
    })
    return {
        mutate,
        isPending,
        errorMessage: error?.message,
        success: isSuccess
    };
}
 
export default useForgottenPassword;