import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { updateCoverImage } from '../../features/user/userActions';

export default function CoverImageForm({user}){

    const dispatch = useAppDispatch();
  const [preview, setPreview] = useState(user?.coverImage);
  const { myProfileLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      await dispatch(updateCoverImage(formData)).unwrap();
    } catch (error) {
      setPreview(user?.coverImage);
      console.error("Cover image upload failed:", error);
    }
  };
    return(
        <div className="space-y-4">
      <div className="relative group w-full aspect-5/1 md:aspect-6/1 bg-neutral-800 rounded-xl overflow-hidden border-2 border-dashed border-neutral-700 hover:border-blue-500 transition-all">
        {preview ? (
          <img 
            src={preview} 
            alt="Cover" 
            className={`w-full h-full object-cover ${myProfileLoading ? 'opacity-40' : 'opacity-100'}`} 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500">
             <IoCloudUploadOutline size={40} className="mb-2" />
             <p className="text-sm">No banner image set</p>
          </div>
        )}

        {/* Upload Overlay */}
        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
          <IoCloudUploadOutline className="text-3xl text-white mb-2" />
          <span className="text-white font-medium text-sm">Upload New Banner</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>

        {myProfileLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <p className="text-xs text-neutral-500">For best results on all devices, use an image that's at least 2048 x 1152 pixels.</p>
    </div>
  );
    
}