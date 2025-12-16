import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks.js";
import { Outlet } from "react-router-dom";

// If user is not logged in → redirect to login page
//with replace user cannot go back to it by pressing back button
export default function ProtectedRoute() {
  const { userInfo,initialized } = useAppSelector((state) => state.auth);
  
  //if auth status is not confirmed then do nothing
  if(!initialized) return <div className="text-black p-4">Checking session...</div>;
  if (!userInfo) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
