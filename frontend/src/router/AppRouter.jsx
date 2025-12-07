import { createBrowserRouter } from 'react-router-dom';
import ErrorPage from '../pages/ErrorPage.jsx';
import Home from '../pages/Homepage.jsx';
import Login from "../pages/LoginPage.jsx";
import Register from "../pages/RegisterPage.jsx";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home/>,
    errorElement: <ErrorPage />,
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> }
]);
