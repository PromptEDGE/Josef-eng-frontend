import { AudioLines, Files, Image, Video } from "lucide-react";
import {  type ReactNode, } from "react";
import { AnimatePresence,motion } from "framer-motion";
import UploadFileBtn from "./UploadFileBtn";
// import UploadBtn from "./UploadBtn";
interface Prop{
    show: boolean
    changeFile: (e?: React.ChangeEvent<HTMLInputElement>)=>void
}
const UploadBtnWrap = ({show,changeFile}:Prop) => {
    type Upload={
        changeFile: (e?: React.ChangeEvent<HTMLInputElement>)=>void
        accept: string
        children: ReactNode
        id:string
        text:string
    }
    const sendUpload: Upload[]= [
        {text:"audio",changeFile: changeFile,accept:"audio/*",children: <AudioLines />,id: "audio"},
        {text:"image",changeFile: changeFile,accept:"image/*",children: <Image/>,id: "image"},
        {text:"video",changeFile: changeFile,accept:"video/*",children: <Video/>,id: "video"},
        {text:"document",changeFile: changeFile,accept:".json, .xml, .yaml, .yml, .log, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .csv, .txt, .rtf,.dwg, .dxf, .step, .stp, .igs, .iges, .sldprt, .sldasm, .ipt, .iam, .obj, .3ds, .skp, .fbx ",children: <Files/>,id: "file"},
    ]

    return ( 
        <div className=" z-20 w-fit duration-500 transition-all transform  flex flex-col gap-3 items-start justify-center ">
                {sendUpload?.map((item,index)=>(
                    <AnimatePresence key={item.id}>
                        {show&&
                            <motion.div
                            key={item.id}
                            initial={{opacity: 0,y:50}}
                            animate={{opacity: 1,y:0}}
                            exit={{opacity: 0,y:-50}}
                            transition={{
                                delay: index*0.2,
                                duration: index*0.2,
                                ease: "easeInOut"
                            }}
                            >
                                    <UploadFileBtn
                                    {...item}
                                    id={item.id}
                                    />
                            </motion.div>
                        }
                    </AnimatePresence>
                    ))}
        </div>
     );
}
 
export default UploadBtnWrap;