import { useAppDispatch, useAppSelector } from './app/hooks';
import { useEffect } from 'react';
import { fetchUser } from './features/auth/authActions';
import { RouterProvider } from 'react-router-dom';
import router from './router/AppRouter';

const App = () => {
  const dispatch = useAppDispatch();
  const { initialized} = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUser());
  }, [ dispatch]);
  if (!initialized) return <div className='text-2xl text-black'>checking session...</div>;

  return <RouterProvider router={router} />; //router remounting ignores auth status completely, since react router cannot preserve navigation state if it's unmounted so do not conditionally return router
};

export default App;
