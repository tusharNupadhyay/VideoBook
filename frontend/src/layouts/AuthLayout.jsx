import { Link, Outlet } from 'react-router-dom';
import { clearError, clearSuccess } from '../features/auth/authSlice';
import { useAppDispatch } from '../app/hooks';
import { IoHomeOutline } from 'react-icons/io5';
import { useEffect } from 'react';

export default function AuthLayout() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white p-4">
      {/* 2. Brand / Home Section */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-all border border-neutral-700 group"
        >
          <IoHomeOutline className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">YourPlatform</h1>
      </div>

      {/* 3. Main Form Container */}
      <div className="w-full max-w-md">
        <Outlet />
      </div>

      {/* 4. Footer Overlay (Optional) */}
      <footer className="mt-12 text-neutral-500 text-xs text-center">
        &copy; 2026 VideoBook. All rights reserved.
      </footer>
    </div>
  );
}
