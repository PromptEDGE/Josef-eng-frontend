import { useMutation } from "@tanstack/react-query";

const useSendMessage = () => {
    const { mutate, isPending, isError, isSuccess } = useMutation({
        mutationFn: async (message: string) => {
            // Simulate sending a message to an API
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ status: 'Message sent', message });
                }, 1000);
            });
        },
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error) => {
            console.error('Error sending message:', error);
        },
    })
    return {
        sendMessage: mutate,
        isPending,
        isError,
        isSuccess
    };
}
 
export default useSendMessage;