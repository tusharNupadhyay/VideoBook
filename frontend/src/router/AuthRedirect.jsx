import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks.js";
import { Outlet } from "react-router-dom";

export default function AuthRedirect(){
    const {userInfo,initialized} = useAppSelector(state => state.auth);
    
    //if auth status is not confirmed then do nothing
    if(!initialized)  return <div className="text-black p-4">Checking session...</div>;
    //if user is logged in block login/register pages
    if(userInfo)
        return <Navigate to="/" replace />;

    return <Outlet />;
}

