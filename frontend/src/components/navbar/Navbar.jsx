import { useAppSelector, useAppDispatch } from '../../app/hooks.js';
import { logoutUser } from '../../features/auth/authActions.js';
import { useNavigate, Link } from 'react-router-dom';
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
import { useState,useEffect,useRef } from 'react';
import { IoIosSearch } from 'react-icons/io';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      //unwrap() turns the thunk action into a real Promise
      //If the thunk succeeds → returns the actual payload (not the whole action)
      //If the thunk fails → it throws an error that we can catch in try/catch
      //This makes error handling and success flows much cleaner.
      await dispatch(logoutUser()).unwrap();
      dispatch(logout());
      dispatch(resetMyProfile());
      dispatch(resetChannelProfile());
      dispatch(resetChannelVideos());
      dispatch(resetUploadState());
      dispatch(resetMyVideos());
      setOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  
  return (
   <nav className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-white/10 flex items-center justify-between px-4 md:px-12 py-2 gap-4">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-white tracking-tighter shrink-0">
        VideoBook
      </Link>

      {/* Search Bar */}
      <div className="flex flex-1 max-w-2xl group">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-2 rounded-l-full focus:outline-none focus:border-blue-500 transition"
        />
        <button className="px-5 bg-neutral-800 border border-l-0 border-neutral-800 rounded-r-full hover:bg-neutral-700 transition cursor-pointer text-xl text-white">
          <IoIosSearch />
        </button>
      </div>

      {/* Auth Actions */}
      <div className="relative" ref={menuRef}>
        {userInfo ? (
          <div className="flex items-center">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center focus:outline-none hover:ring-2 hover:ring-white/20 rounded-full transition"
            >
              <img src={userInfo.avatar} className="h-9 w-9 rounded-full object-cover" alt="avatar" />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-800 mb-1">
                  <p className="text-sm font-semibold text-white truncate">{userInfo.username}</p>
                  <p className="text-xs text-neutral-400 truncate">{userInfo.email}</p>
                </div>
                
                <DropDownItem label="My Profile" onClick={() => { navigate('/profile'); setOpen(false); }} />
                <DropDownItem label="Upload Video" onClick={() => { navigate('/upload'); setOpen(false); }} />
                <DropDownItem label="Logout" variant="danger" onClick={handleLogout} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Link 
              to="/auth/login" 
              className="px-4 py-2 text-blue-500 hover:bg-blue-500/10 rounded-full text-sm font-semibold transition"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function DropDownItem({ label, onClick, variant = 'default' }) {
  const colors = variant === 'danger' ? 'text-red-500 hover:bg-red-500/10' : 'text-neutral-300 hover:bg-white/10';
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${colors}`}
    >
      {label}
    </button>
  );
}
