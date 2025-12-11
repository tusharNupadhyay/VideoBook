import { createBrowserRouter } from 'react-router-dom';
//Layouts
import MainLayout from '../layouts/MainLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
//Pages
import Error from '../pages/ErrorPage.jsx';
import Home from '../pages/Home.jsx';
import Watch from '../pages/Watch.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Channel from '../pages/Channel.jsx';
import Upload from '../pages/Upload.jsx';
// Protected wrapper
import ProtectedRoute from './ProtectedRouter.jsx';
import AuthRedirect from './AuthRedirect.jsx';

const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, //mainLayout contains sidebar,navbar and outlet
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> }, //index: true mean default path inside outlet
      { path: 'watch/:videoId', element: <Watch /> },
      {
        path: 'upload',
        element: (
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        ),
      },
      { path: 'channel/:username', element: <Channel /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        ),
      },
      {
        path: 'register',
        element: (
          <AuthRedirect>
            <Register />
          </AuthRedirect>
        ),
      },
    ],
  },
]);

export default AppRouter;
