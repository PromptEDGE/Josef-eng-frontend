import { getFile } from "@/lib/redux/slice/librarySlice";
import { addToLibrary } from "@/api/project";
import { LibraryItem } from "@/utils/types";
import {  useMutation } from "@tanstack/react-query";
// import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetDocument = (library:LibraryItem) => {
    const dispatch = useDispatch()

    const { data, isPending, isError,  isSuccess } = useMutation({
        mutationFn: ({library,access}:{library:LibraryItem,access:string}) => addToLibrary({library,access}),
        onSuccess: (data) => {
            console.log(data);
            // add library slice in redux
            dispatch(getFile(data))
        },
        onError: (error) => {
            console.error("Error fetching document:", error);
        }
    })
    useEffect(()=>{
        if(data){
            // save to redux
        }
    },[data])
    return {
        data,
        isPending,
        isError,
        isSuccess,
    };
}
 
export default useGetDocument;