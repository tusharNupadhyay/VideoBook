import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks.js";

export default function AuthRedirect({children}){
    const {userInfo} = useAppSelector(state => state.auth);

    //if user is logged in block login/register pages
    if(userInfo)
        return <Navigate to="/" replace />;

    return children;
}

