 const MessageFile = ({message}:{message: string})=>{
    return (
        <div  className="w-full h-full ">
            {message.startsWith("data:image") && (
            <img src={message} alt="Uploaded image" className="max-w-sm w-full h-full " />
            )}
            {message.startsWith("data:audio") && (
            <audio src={message} controls />
            )}

            {message.startsWith("data:video") && (
            <video controls className="max-w-sm w-full h-full ">
                <source src={message} />
                Your browser does not support the video tag.
            </video>
            )}

            {message.startsWith("data:application") && (
            <iframe src={message} title="Document" className="w-full h-full" />
            )}
        </div>
    )
}
export default MessageFile