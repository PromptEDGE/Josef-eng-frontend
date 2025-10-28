import { CreateProjectType } from "@/utils/types";
import { useToast } from "./use-toast";
import { useMutation } from "@tanstack/react-query";
import { createProject } from "@/api/project";
import useProjects from "./useProjects";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isAxiosError } from "axios";

const useCreateProject = () => {
    const { toast } = useToast()
    const {refetchProjects} = useProjects()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {mutate, error, data, isPending} = useMutation({
        mutationFn: (formData: CreateProjectType) => createProject(formData),
        onSuccess: (data) => {
        refetchProjects()
        toast({
            title: "Success",
            description: "Project created successfully.",
        });
        navigate(`/project/${data?.id}`);
        },
        onError: (error) => {
            if(isAxiosError(error)){
                console.log(error)
                toast({
                    title: "Error",
                    description: error.response?.data.detail,
                    variant: "destructive",
                })
            }else{
                toast({
                    title: "Error",
                    description: error.message || "Failed to create project.",
                    variant: "destructive",
                });
            }
        }
  });
    return {
        mutate,
        data,
        error,
        isPending
    };
}
 
export default useCreateProject;