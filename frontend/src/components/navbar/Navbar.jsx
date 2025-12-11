import { useAppSelector, useAppDispatch } from '../../app/hooks.js';
import { logoutUser } from '../../features/auth/authActions.js';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      //unwrap() turns the thunk action into a real Promise
      //If the thunk succeeds → returns the actual payload (not the whole action)
      //If the thunk fails → it throws an error that we can catch in try/catch
      //This makes error handling and success flows much cleaner.
      navigate('/');
    } catch (err) {
      console.log('Logout failed:', err);
      navigate('/');
    }
  };
  return (
    <nav className="h-16 bg-white shadow flex items-center px-4 gap-2">
      <p className="px-4 py-2 font-semibold text-gray-700 ">VideoBook</p>
      <div className="flex flex-1 justify-center mx-30 border-gray-400 rounded gap-2 ">
        <input
          type="text"
          placeholder="search"
          className="focus:outline-none flex-1 w-1.5 rounded  px-3 py-2 bg-slate-200"
        />
        <button className="px-4 py-2 bg-slate-300 hover:bg-slate-400 rounded">
          {' '}
          search
        </button>
      </div>
      {userInfo ? (
        // If user is logged in
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>

          <button
            onClick={() => {
              console.log(userInfo);
              navigate('/profile');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-4xl hover:bg-blue-800"
          >
            Profile
          </button>
        </div>
      ) : (
        // If user is NOT logged in
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/auth/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-4xl transition hover:bg-blue-800"
          >
            Login
          </button>

          <button
            onClick={() => navigate('/auth/register')}
            className="px-4 py-2 bg-blue-600 text-white rounded-4xl hover:bg-blue-800"
          >
            Register
          </button>
        </div>
      )}
    </nav>
  );
}
