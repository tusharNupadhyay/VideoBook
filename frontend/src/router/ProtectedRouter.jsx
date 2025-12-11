import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks.js";


// If user is not logged in → redirect to login page
//with replace user cannot go back to it by pressing back button
export default function ProtectedRoute({ children }) {
  const { userInfo } = useAppSelector((state) => state.auth);


  if (!userInfo) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
