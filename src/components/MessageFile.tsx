import { logger } from "@/utils/logger";
import { Loader, X } from "lucide-react"

 const MessageFile = ({message,uploading,filename}:{message: string,uploading?:boolean,filename?: string})=>{
    // Extract filename from storage path if filename not provided
    // If we have a storage path like "uploads/uuid.ext", extract just the extension part for display
    let displayName = filename;
    if (!displayName && message) {
        if (message.startsWith("data:")) {
            // For data URLs, try to extract from the data URL itself
            displayName = "Uploaded file";
        } else if (message.includes('/')) {
            // For storage paths, extract the last part (filename)
            const pathPart = message.split('/').pop()?.split('?')[0] || "";
            // If it's a UUID-based filename, show just the extension or a generic name
            if (pathPart.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\./i)) {
                // It's a UUID filename, extract extension
                const ext = pathPart.split('.').pop()?.toUpperCase() || "FILE";
                displayName = `Uploaded ${ext} file`;
            } else {
                displayName = pathPart;
            }
        } else {
            displayName = message;
        }
    }
    displayName = displayName || "Uploaded file";
    
    return (
        <div  className="w-[130px] flex items-start justify-start h-[100px] relative ">
            {uploading&&(
                <div className="absolute rounded-lg inset-0 flex items-center justify-center bg-black/30 ">
                    <Loader className="w-4 h-4 text-white animate-spin" />
                </div>
            )}
            {message.startsWith("data:image") && (
            <img src={message} alt={displayName} className="max-w-sm w-full h-full rounded-lg " />
            )}
            {message.startsWith("data:audio") && (
            <audio src={message} controls className="w-full h-full rounded-lg " title={displayName} />
            )}

            {message.startsWith("data:video") && (
            <video controls className="max-w-sm w-full h-full rounded-lg " title={displayName}>
                <source src={message} />
                Your browser does not support the video tag.
            </video>
            )}

            {message.startsWith("data:application") && (
            <iframe src={message} title={displayName} className="w-full h-full rounded-lg" />
            )}
            {/* Display filename if it's a storage path or filename is provided */}
            {(displayName && !message.startsWith("data:")) && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                    {displayName}
                </div>
            )}
            <div className="bg-white rounded-full p-1 flex items-center justify-center absolute top-2 right-2 cursor-pointer ">
                <X size={14} className=" " />
            </div>
        </div>
    )
}
export default MessageFile