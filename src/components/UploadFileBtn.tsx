import { logger } from "@/utils/logger";
import {  useState, type ReactNode, } from "react";
interface Prop {
    children:ReactNode,
    accept:string,
    id:string
    changeFile: (e?: React.ChangeEvent<HTMLInputElement>)=>void
    text:string
}
const UploadFileBtn = ({children,accept,id,text,changeFile}:Prop) => {
    const [inputKey, setInputKey] = useState<number>(Date.now());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeFile(e);

    // Reset input value so same file can be uploaded again
    setInputKey(Date.now())
  };
    return (
        <>
            <div className=" text-black duration-500 transition-all transform group hover:scale-105 p-2 flex items-center justify-start cursor-pointer ">
                <input key={inputKey} onChange={handleChange} hidden id={id} type="file" multiple accept={accept} className="" />
                <label htmlFor={id} className="cursor-pointer flex gap-1 items-center justify-start capitalize " >
                    {children}
                    <p className="text-sm">{text}</p>
                </label>
            </div>
        </>
      );
}
 
export default UploadFileBtn;
