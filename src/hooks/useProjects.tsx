import { logger } from "@/utils/logger";
import { getProjects } from "@/api/project";
import { getAllProject } from "@/lib/redux/slice/projectSlice";
import { RootState } from "@/lib/redux/store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "./useAuth";

const useProjects = () => {
    const dispatch = useDispatch()
    const { user: authUser } = useAuth(); // Get authenticated user from TanStack Query
    const projects = useSelector((state:RootState)=>state.project.project)
    const { data,refetch:refetchProjects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => getProjects(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!authUser // Enable when user is authenticated (httpOnly cookie)
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
