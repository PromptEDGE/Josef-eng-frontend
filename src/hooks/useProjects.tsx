import { logger } from "@/utils/logger";
import { getProjects } from "@/api/project";
import { getAllProject } from "@/lib/redux/slice/projectSlice";
import { RootState } from "@/lib/redux/store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useProjects = () => {
    const dispatch = useDispatch()
    const user = useSelector((state:RootState)=>state.localStorage.user)
    const projects = useSelector((state:RootState)=>state.project.project)
    const { data,refetch:refetchProjects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => getProjects(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!user?.access_token
    })
    useEffect(()=>{
        if(data){
            dispatch(getAllProject(data))
        }
    },[data,dispatch])
    return {
        projects,
        refetchProjects
    };
}
 
export default useProjects;
