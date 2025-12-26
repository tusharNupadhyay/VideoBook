import { useAppSelector, useAppDispatch } from '../../app/hooks.js';
import { logoutUser } from '../../features/auth/authActions.js';
import { useNavigate } from 'react-router-dom';
import {
  resetMyProfile,
  resetChannelProfile,
} from '../../features/user/userSlice.js';
import {
  resetChannelVideos,
  resetMyVideos,
  resetUploadState,
} from '../../features/video/videoSlice.js';
import {
  logout,
  clearError,
  clearSuccess,
} from '../../features/auth/authSlice.js';
import { useState } from 'react';
import { IoIosSearch } from 'react-icons/io';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);
  
  return (
    <nav className=" bg-gray-200 shadow flex items-center justify-between gap-1 px-12 py-2">
      <p className="px-4 py-2 font-semibold text-gray-700 ">VideoBook</p>
      <div className="flex flex-1 mx-6 max-w-xl  rounded ">
        <input
          type="text"
          placeholder="search"
          className="focus:outline-none focus:ring-2 focus:ring-gray-600 mr-1  rounded flex-1 px-4 py-2 bg-slate-300"
        />
        <button className="px-4 py-2 bg-gray-400 hover:bg-gray-500 rounded cursor-pointer">
          <IoIosSearch />
        </button>
      </div>

      <div className="relative text-left px-2">
        {userInfo ? (
          <button
            className={`flex rounded cursor-pointer items-center gap-2 px-4 py-1 hover:bg-gray-300 focus:outline-none ${open ? 'bg-gray-300 focus:ring-2 focus:ring-gray-500 ' : 'bg-gray-200'}`}
            onClick={() => setOpen(!open)}
          >
            <img
              src={userInfo.avatar}
              className="h-8 w-8 rounded-full"
              alt="user"
            />
            <span className="hidden sm:block">{userInfo?.username}</span>

            {open && (
              <div className="absolute gap-2 flex flex-col px-2 py-1 top-full mt-2 w-48 rounded-md bg-gray-100 shadow-lg left-1/2 -translate-x-1/2 transition-">
                <DropDownItem
                  label={'My Profile'}
                  link={'/profile'}
                />
                <DropDownItem
                  label={'Logout'}
                  link={'/logout'}
                />
                <DropDownItem
                  label={'upload'}
                  link={'/upload'}
                />
              </div>
            )}
          </button>
        ) : (
          // If user is NOT logged in
          <div className="flex gap-4">
            <button
              onClick={() => {
                dispatch(clearError());
                dispatch(clearSuccess());
                navigate('/auth/login');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-4xl transition hover:bg-blue-800"
            >
              Login
            </button>

            <button
              onClick={() => {
                dispatch(clearError());
                dispatch(clearSuccess());
                navigate('/auth/register');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-4xl hover:bg-blue-800"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function DropDownItem({ label, link }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap(); //logout from backend
      //unwrap() turns the thunk action into a real Promise
      //If the thunk succeeds → returns the actual payload (not the whole action)
      //If the thunk fails → it throws an error that we can catch in try/catch
      //This makes error handling and success flows much cleaner.
      dispatch(logout()); //clears auth slice

      dispatch(resetMyProfile()); //clear user stats slice
      dispatch(resetChannelProfile());

      dispatch(resetChannelVideos());
      dispatch(resetUploadState());
      dispatch(resetMyVideos());
      navigate('/');
    } catch (err) {
      console.log('Logout failed:', err);
      navigate('/');
    }
  };
  return (
    <div className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-300"
      onClick={() => {
        if(link=='/logout')
        {
          handleLogout();
        }

        else
        navigate(link);
        
      }}
    >
      <p>{label}</p>
    </div>
  );
}
