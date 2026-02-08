import { useForm } from 'react-hook-form';
import { uploadVideo } from '../features/video/videoAction';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { clearUploadError } from '../features/video/videoSlice';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BiImageAdd } from 'react-icons/bi';
import { useEffect } from 'react';


export default function Upload() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { uploadLoading, uploadError } = useAppSelector((state) => state.video);

  //local state for video previews
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    resetField,
  } = useForm();

  useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (uploadLoading) {
      e.preventDefault();
      e.returnValue = ''; // to show the warning when we refresh
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [uploadLoading]);

  // Helper to generate a preview URL
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      //If an old preview URL exists, browser releases that memory
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      // Create a temporary local URL for the image
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up the old one if it exists
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      // Set the new one
      setVideoPreview(URL.createObjectURL(file));
    }
  };
  const handleRemoveVideo = () => {
    // 1. Clean up the memory
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    // 2. Clear the local state
    setVideoPreview(null);

    // 3. Clear the form state specifically for the videoFile
    // Use resetField if you're on a newer version of react-hook-form
    resetField('videoFile');

    // Or use setValue if resetField isn't available
    // setValue('videoFile', null);
  };

  const onSubmit = async (data) => {
    if (uploadLoading) return; //prevents double submit by enter key
    const formData = new FormData();

    formData.append('videoFile', data.videoFile[0]);
    formData.append('thumbnail', data.thumbnail[0]);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);

    try {
      dispatch(clearUploadError());
      //dispatch returns a promise that resolves to a redux action, not your api data,unwrap is used in try catch block to catch error after dispatch,without unwrap catch will not run, but don't use unwrap when UI reacts to redux state instead
      await dispatch(uploadVideo(formData)).unwrap();
      // Clean up the URL to prevent memory leaks
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      reset();
      setVideoPreview(null);
      //navigate to video page
      navigate('/profile');
    } catch (error) {
      console.log('Video upload error: ', error);
    }
  };
  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#0f0f0f] text-white rounded-xl border border-neutral-800 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <IoCloudUploadOutline className="text-blue-500" /> Upload Video
      </h2>

      {uploadError && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 text-sm">
          {uploadError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* The Video Player (Only shows if a file is picked) */}
        {videoPreview && (
          <div className="relative group">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
              <video src={videoPreview} controls className="w-full h-full" />
            </div>
            {/* The Remove Button */}
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md shadow-lg transition-transform active:scale-95"
            >
              Remove Video
            </button>
          </div>
        )}

        {!videoPreview && ( <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Select Video</label>
          <input
            type="file"
            className='bg-neutral-900 border-neutral-800 rounded-lg p-2.5'
            accept="video/*"
            {...register('videoFile', {
              required: true,
              onChange: handleVideoChange,
            })}
          />
        </div>)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thumbnail Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-400">
              Thumbnail
            </label>
            {/* The Preview Box */}
            <div className="w-full aspect-video bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center overflow-hidden">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="text-neutral-500 flex flex-col items-center">
                  <BiImageAdd className="text-4xl" />
                  <span className="text-xs">No image selected</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              {...register('thumbnail', {
                required: 'Thumbnail is required',
                onChange: handleThumbnailChange, // Triggers preview
              })}
            />
            {errors.thumbnail && (
              <p className="text-red-500 text-xs">{errors.thumbnail.message}</p>
            )}
          </div>
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-400">
              Title
            </label>
            <input
              type="text"
              placeholder="Give your video a title"
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title.message}</p>
            )}
          </div>
        </div>
        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-400">
            Description
          </label>
          <textarea
            rows="4"
            placeholder="Tell viewers about your video"
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            {...register('description', {
              maxLength: { value: 500, message: 'Max 500 characters' },
            })}
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={uploadLoading}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
            uploadLoading
              ? 'bg-blue-800 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98]'
          }`}
        >
          {uploadLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : (
            'Publish Video'
          )}
        </button>
      </form>
    </div>
  );
}
