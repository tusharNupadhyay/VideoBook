import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks.js';

// If user is not logged in → redirect to login page
//with replace user cannot go back to it by pressing back button
export default function ProtectedRoute() {
  const { userInfo } = useAppSelector((state) => state.auth);
  const location = useLocation(); // Capture the URL they were trying to visit

  // Since App.jsx handles the 'initialized' check, we only check for userInfo here.
  if (!userInfo) {
    // Pass the current location in the "state" property
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
