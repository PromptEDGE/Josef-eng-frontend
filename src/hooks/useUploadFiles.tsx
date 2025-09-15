import { uploadDocument } from "@/api/documents";
import { useMutation } from "@tanstack/react-query";

const useUploadDocument = () => {
    const { mutate, isPending, isError, isSuccess, data } = useMutation({
        mutationFn: ({type,file,projId,access_token}:{projId:string,access_token:string,type:"IMAGE"|"VIDEO"|"AUDIO"|"DOCUMENT",file:File}) => uploadDocument({type,file,projId,access_token}),
    })
    return {
        uploadFile: mutate,
        isPending,
        isError,
        isSuccess, 
        data
    };
}
 
export default useUploadDocument;