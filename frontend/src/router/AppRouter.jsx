import { createBrowserRouter } from 'react-router-dom';
//Layouts
import MainLayout from '../layouts/MainLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
//Pages
import {
  ErrorPage,
  Home,
  Watch,
  Login,
  Register,
  Channel,
  Upload,
  Profile,
  MyVideos,
  EditPage,
  WatchHistory,
  LikedVideos,
  Playlists,
  PlaylistDetails
} from '../pages/index.js';
// Protected wrapper
import ProtectedRoute from './ProtectedRouter.jsx';
import AuthRedirect from './AuthRedirect.jsx';

const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, //mainLayout contains sidebar,navbar and outlet
    errorElement: <ErrorPage />, //route level error boundary, renders errorPage when anything goes wrong while resolving this route (can catch error thrown in loader thunks)
    children: [
      { index: true, element: <Home /> },
      { path: 'watch/:videoId', element: <Watch /> },
       
      // protected layout
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <Profile /> },
          { path: 'upload', element: <Upload /> },
          { path: 'myVideos', element: <MyVideos /> },
           { path: 'myVideos/edit/:videoId', element: <EditPage /> },
           { path: 'history', element: <WatchHistory /> },
           { path: 'likedVideos', element: <LikedVideos /> },
           {path: 'playlists', element: <Playlists />},
        ],
      },
      { path: 'playlists/:playlistId', element: <PlaylistDetails /> },
      { path: 'channel/:username', element: <Channel /> },    
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        element: <AuthRedirect />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          { path: 'register', element: <Register /> },
        ],
      },
    ],
  },
]);

export default AppRouter;
