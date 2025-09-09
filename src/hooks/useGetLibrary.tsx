import { getLibrary } from "@/api/project";
import {  getAllLibrary } from "@/lib/redux/slice/librarySlice";
import { RootState } from "@/lib/redux/store";
import { LibraryItem } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetLibrary = () => {
    const dispatch = useDispatch()
    const user = useSelector((state:RootState) => state.localStorage.user);
    const access = user?.access_token
    const { data,refetch,isError,isSuccess } = useQuery({
        queryKey: ['library', access],
        queryFn: () => getLibrary(access),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
    useEffect(()=>{
        if(data){
            const library: LibraryItem[] = data 
            // save to redux
            dispatch(getAllLibrary(library))
        }
    },[data,dispatch])
    return {
        data,
        refetch,
        isError,
        isSuccess,
    };
}
 
export default useGetLibrary;