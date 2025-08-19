import { RootState } from "@/lib/redux/store";
import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoutesAuth = ({children}:{children:ReactNode}) => {
    const user = useSelector((state:RootState)=>state.user.user)
        if(user){
            
            return <Navigate replace to="/" />
        }
    return (
    <>
        {children}
    </>
    )
}
 
export default RoutesAuth;