import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { resetSingleVideo } from '../features/video/videoSlice';
import { useState } from 'react';
import {
  fetchVideoById,
  updateVideoDetails,
} from '../features/video/videoAction';

export default function EditVideosPage() {
  const [preview, setPreview] = useState(null);
  const { videoId } = useParams();
  const dispatch = useAppDispatch();
  const { singleVideo, fetchLoading, fetchError } = useAppSelector(
    (state) => state.video
  );
  const navigate = useNavigate();

  //additional measure to prevent multiple rerenders
  const isPrimed = useRef(false);

  //isDirty: boolean , dirtyFields: objects which changes
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, dirtyFields },
  } = useForm({
    defaultValues: { title: '', description: '', thumbnail: null },
  });

  useEffect(() => {
    //fetch video details from videoId
    dispatch(fetchVideoById(videoId));
    return () => {
      dispatch(resetSingleVideo());
    };
  }, [videoId, dispatch]);

  useEffect(() => {
    if (singleVideo && !isPrimed.current) {
      reset({
        title: singleVideo.title,
        description: singleVideo.description || '',
        thumbnail: null,
      });

      setPreview(singleVideo.thumbnail);
      isPrimed.current = true;
    }
  }, [singleVideo, reset]);

  // Reset the ref if the videoId changes (so a new video can be edited)
  useEffect(() => {
    isPrimed.current = false;
  }, [videoId]);

  const onSubmit = async (data) => {
    const formData = new FormData();

    if (dirtyFields.title) {
      formData.append('title', data.title);
    }

    if (dirtyFields.description) {
      formData.append('description', data.description);
    }

    if (dirtyFields.thumbnail?.[0]) {
      formData.append('thumbnail', data.thumbnail[0]);
    }
    try {
      await dispatch(updateVideoDetails({ videoId, formData })).unwrap();
      navigate('/myVideos');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // If the existing preview is a Blob (from a previous selection), revoke it
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
  };

  if (fetchLoading)
    return (
      <div className="p-10 text-center text-white">Loading video data...</div>
    );

  return (
    <div className="flex-1 bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Edit Video Details</h2>

        {fetchError && (
          <div className="p-4 bg-red-900/20 text-red-500 rounded mb-4">
            {fetchError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 bg-neutral-900 p-8 rounded-xl border border-neutral-800"
        >
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Title
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full bg-[#0f0f0f] border border-neutral-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Description
            </label>
            <textarea
              {...register('description', { maxLength: 5000 })}
              rows="5"
              className="w-full bg-[#0f0f0f] border border-neutral-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Thumbnail
            </label>
            <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border-2 border-dashed border-neutral-700 group hover:border-blue-500 transition">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500">
                  No Image
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition pointer-events-none">
                <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold">
                  Change Thumbnail
                </span>
              </div>

              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                {...register('thumbnail', { onChange: handleThumbnailChange })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-neutral-800">
            <button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/myVideos')}
              className="px-8 py-2.5 bg-neutral-800 text-white rounded-full font-bold hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
