import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateAvatarImage } from '../../features/user/userActions';
import { IoCameraOutline } from 'react-icons/io5';

export default function AvatarForm({ user }) {
  const dispatch = useAppDispatch();
  const [preview, setPreview] = useState(user?.avatar);
  const { myProfileLoading } = useAppSelector((state) => state.user);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local Preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Prepare upload
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await dispatch(updateAvatarImage(formData)).unwrap();
    } catch (error) {
      setPreview(user?.avatar); // Revert on failure
      console.error('Avatar upload failed:', error);
    }
  };
  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="relative group w-32 h-32 shrink-0">
        <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-neutral-800 group-hover:ring-blue-500 transition-all duration-300">
          <img
            src={preview}
            alt="Avatar"
            className={`w-full h-full object-cover ${myProfileLoading ? 'opacity-50' : 'opacity-100'}`}
          />
        </div> 

        {/* Hover Overlay */}
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
          <IoCameraOutline className="text-3xl text-white" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={myProfileLoading}
          />
        </label>

        {/* Loading Spinner */}
        {myProfileLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="text-center md:text-left">
        <p className="text-sm text-neutral-400 mb-2">
          Recommended: 800x800px. JPG or PNG.
        </p>
        <button
          onClick={() => document.getElementById('avatar-input').click()}
          className="text-blue-500 text-sm font-semibold hover:underline"
        >
          Change Profile Picture
        </button>
        <input
          id="avatar-input"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
