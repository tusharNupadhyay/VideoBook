import { useAppDispatch, useAppSelector } from './app/hooks';
import { useEffect } from 'react';
import { fetchUser } from './features/auth/authActions';
import { RouterProvider } from 'react-router-dom';
import router from './router/AppRouter';
import { getMyProfile } from './features/user/userActions';

const App = () => {
  const dispatch = useAppDispatch();
  const { initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initApp = async () => {
      try {
        // fetchUser checks if a valid cookie/token exists
        const user = await dispatch(fetchUser()).unwrap();

        // Only fetch profile if a user was actually returned
        if (user) {
          await dispatch(getMyProfile()).unwrap();
        }
      } catch (err) {
        // If fetchUser fails, then user is a guest.
        // catch the error here so the app doesn't crash or log red lines.
        if (import.meta.env.MODE === 'development') {
          console.log('Session check: No active session found (Guest Mode)');
        }
      }
    };

    initApp();
  }, [dispatch]);

  if (!initialized) {
    return (
      <div className="h-screen w-full bg-[#0f0f0f] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-medium animate-pulse">Initializing...</p>
      </div>
    );
  }
  return <RouterProvider router={router} />; //router remounting ignores auth status completely, since react router cannot preserve navigation state if it's unmounted so do not conditionally return router
};

export default App;
