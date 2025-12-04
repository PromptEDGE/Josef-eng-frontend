import { logger } from "@/utils/logger";
import { sendMessageToProject, UploadedFileData } from "@/api/chat";
import { useMutation } from "@tanstack/react-query";

const useSendMessage = () => {
    const { mutate, isPending, isError, isSuccess, data } = useMutation({
        mutationFn: async ({
            id,
            message,
            uploadedFiles
        }: {
            id: string;
            message: string;
            uploadedFiles?: UploadedFileData[];
        }) => sendMessageToProject({id, message, uploadedFiles}),
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
