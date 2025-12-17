import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const RoutesAuth = ({children}:{children:ReactNode}) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
        );
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate replace to="/" />
    }

    // Not authenticated - allow signin/signup pages
    return (
    <>
        {children}
    </>
    )
}

export default RoutesAuth;