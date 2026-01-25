import { AudioLines, Files, Image, Video, Circle, Mic } from "lucide-react";
import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UploadFileBtn from "./UploadFileBtn";

interface Prop {
  show: boolean;
  changeFile: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  onRecordVideo?: () => void;
  onRecordAudio?: () => void;
}

type Upload = {
  changeFile: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  children: ReactNode;
  id: string;
  text: string;
};

const UploadBtnWrap = ({ show, changeFile, onRecordVideo, onRecordAudio }: Prop) => {
  const sendUpload: Upload[] = [
    { text: "audio", changeFile, accept: "audio/*", children: <AudioLines />, id: "audio" },
    { text: "image", changeFile, accept: "image/*", children: <Image />, id: "image" },
    { text: "video", changeFile, accept: "video/*", children: <Video />, id: "video" },
    {
      text: "document",
      changeFile,
      accept: ".json, .xml, .yaml, .yml, .log, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .csv, .txt, .rtf,.dwg, .dxf, .step, .stp, .igs, .iges, .sldprt, .sldasm, .ipt, .iam, .obj, .3ds, .skp, .fbx ",
      children: <Files />,
      id: "file",
    },
  ];

  const recordButtons = [
    { id: "record-video", text: "Record video", icon: Video, onClick: onRecordVideo },
    { id: "record-audio", text: "Record audio", icon: Mic, onClick: onRecordAudio },
  ];

  return (
    <div className="z-20 w-fit duration-500 transition-all transform flex flex-col gap-3 items-start justify-center">
      {sendUpload.map((item, index) => (
        <AnimatePresence key={item.id}>
          {show && (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{
                delay: index * 0.2,
                duration: index * 0.2,
                ease: "easeInOut",
              }}
            >
              <UploadFileBtn {...item} id={item.id} />
            </motion.div>
          )}
        </AnimatePresence>
      ))}
      {recordButtons.map(
        (btn, index) =>
          show &&
          btn.onClick && (
            <AnimatePresence key={btn.id}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{
                  delay: (sendUpload.length + index) * 0.2,
                  duration: 0.2,
                  ease: "easeInOut",
                }}
                className="text-black duration-500 transition-all transform group hover:scale-105 p-2 flex items-center justify-start cursor-pointer w-full"
                onClick={btn.onClick}
              >
                <btn.icon className="h-4 w-4" />
                <span className="ml-1 text-sm capitalize">{btn.text}</span>
                <Circle className="ml-1 h-2.5 w-2.5 fill-current text-red-500" />
              </motion.div>
            </AnimatePresence>
          )
      )}
    </div>
  );
};
 
export default UploadBtnWrap;