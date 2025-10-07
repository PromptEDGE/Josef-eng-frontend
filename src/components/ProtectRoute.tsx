import { RootState } from "@/lib/redux/store";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({children}:{children:ReactNode}) => {
    const user = useSelector((state:RootState)=>state.localStorage.user)
        // if(!user){
        //     return <Navigate replace to="/signin" />
        // }
    return (
    <>
        {children}
    </>
    )
}
 
export default ProtectedRoutes;