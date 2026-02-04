import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks.js';
import { Outlet } from 'react-router-dom';

export default function AuthRedirect() {
  const { userInfo } = useAppSelector((state) => state.auth);

  // If already logged in, send them to home.
  // This prevents logged-in users from manually typing /auth/login in the URL.
  if (userInfo) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
