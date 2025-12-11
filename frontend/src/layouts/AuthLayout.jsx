import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { clearError, clearSuccess } from '../features/auth/authSlice';
import { useAppDispatch } from '../app/hooks';
export default function AuthLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  return (
    <>
      <div className=" min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1>Authentication</h1>
        <button
          onClick={() => {
            dispatch(clearError());
            dispatch(clearSuccess());
            navigate('/');
          }}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Home
        </button>
        <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
          <Outlet />
        </div>
      </div>
    </>
  );
}
