import {  useState, type ReactNode, } from "react";
interface Prop {
    children:ReactNode,
    accept:string,
    id:string
    changeFile: (e?: React.ChangeEvent<HTMLInputElement>)=>void
}
const UploadFileBtn = ({children,accept,id,changeFile}:Prop) => {
    const [inputKey, setInputKey] = useState<number>(Date.now());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeFile(e);

    // Reset input value so same file can be uploaded again
    setInputKey(Date.now())
  };
    return (
        <>
            <div className="bg-white shadow hover:shadow-2xl text-[#333] border-[2px] border-white duration-500 transition-all transform group hover:scale-105 p-2 rounded-full w-[40px] h-[40px] flex items-center justify-center cursor-pointer ">
                <input key={inputKey} onChange={handleChange} hidden id={id} type="file" accept={accept} className="" />
                <label htmlFor={id} className="cursor-pointer" >
                    {children}
                </label>
            </div>
        </>
      );
}
 
export default UploadFileBtn;