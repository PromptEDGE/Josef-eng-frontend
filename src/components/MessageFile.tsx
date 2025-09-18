import { Loader, X } from "lucide-react"

 const MessageFile = ({message,uploading}:{message: string,uploading?:boolean})=>{
    return (
        <div  className="w-[130px] flex items-start justify-start h-[100px] relative ">
            {uploading&&(
                <div className="absolute rounded-lg inset-0 flex items-center justify-center bg-black/30 ">
                    <Loader className="w-4 h-4 text-white animate-spin" />
                </div>
            )}
            {message.startsWith("data:image") && (
            <img src={message} alt="Uploaded image" className="max-w-sm w-full h-full rounded-lg " />
            )}
            {message.startsWith("data:audio") && (
            <audio src={message} controls className="w-full h-full rounded-lg " />
            )}

            {message.startsWith("data:video") && (
            <video controls className="max-w-sm w-full h-full rounded-lg ">
                <source src={message} />
                Your browser does not support the video tag.
            </video>
            )}

            {message.startsWith("data:application") && (
            <iframe src={message} title="Document" className="w-full h-full rounded-lg" />
            )}
            <div className="bg-white rounded-full p-1 flex items-center justify-center absolute top-2 right-2 cursor-pointer ">
                <X size={14} className=" " />
            </div>
        </div>
    )
}
export default MessageFile