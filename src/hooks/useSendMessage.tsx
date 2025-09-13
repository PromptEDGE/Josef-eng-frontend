import { sendMessageToProject } from "@/api/chat";
import { useMutation } from "@tanstack/react-query";

const useSendMessage = () => {
    const { mutate, isPending, isError, isSuccess, data } = useMutation({
        mutationFn: async ({id, access, message}:{id:string, access:string, message:string}) => sendMessageToProject({id, access, message}),
    })
    return {
        sendMessage: mutate,
        isPending,
        isError,
        isSuccess, 
        data
    };
}
 
export default useSendMessage;