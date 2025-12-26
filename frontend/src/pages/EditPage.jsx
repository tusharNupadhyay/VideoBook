import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { resetSingleVideo } from '../features/video/videoSlice';
import { useState } from 'react';
import {
  fetchVideoById,
  updateVideoDetails,
} from '../features/video/videoAction';

export default function EditPage() {
  const [preview, setPreview] = useState(null);
  const { videoId } = useParams();
  const dispatch = useAppDispatch();
  const { singleVideo, fetchLoading, fetchError } = useAppSelector(
    (state) => state.video
  );
  const navigate = useNavigate();

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
  }, [videoId, dispatch]);

  useEffect(() => {
    //only after reseting these values will isDirty become active
    if (singleVideo) {
      reset({
        title: singleVideo.title,
        description: singleVideo.description || '',
        thumbnail: null,
      });

      setTimeout(() => {
      setPreview(singleVideo.thumbnail || null); //cannot call setPreview synchronously inside a useEffect that runs during render,
    }, 0);                                       //which can cause extra rerenders             
    }
  }, [singleVideo, reset]);

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
      const result = await dispatch(
        updateVideoDetails({ videoId, formData })
      ).unwrap();
      console.log('update fields: ', result);
      dispatch(resetSingleVideo());
      navigate('/myVideos');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (fetchLoading) return <div className="text-white">Loading videos...</div>;
  return (
    <div className=" bg-black/90 flex-1  text-gray-300 ">
      {fetchError && <p className="text-red-500 mb-2">{fetchError}</p>}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col mx-20 mt-10 "
      >
        <label className="block mb-2 font-medium">Title</label>
        <input
          {...register('title')}
          className="border p-2 w-full mb-4 rounded"
        />

        <label className="block mb-2 font-medium">Description</label>
        <textarea
          {...register('description', { maxLength: 250 })}
          className="border p-2 w-full mb-4 rounded"
        />
        <label className="flex items-center p-2  ">
              Update thumbnail
            </label>
        <div className="relative flex border-2 flex-col overflow-hidden w-80 h-36 cursor-pointer mb-2 hover:opacity-20 rounded">
          
          {preview && (
            <img
              src={preview}
              alt="thumbnail preview"
              className="w-full h-full object-cover"
            />
          ) }
          <input
            type="file"
            accept="image/*"
            className="inset-0 absolute w-full opacity-0 cursor-pointer"
            {...register('thumbnail', {
              onChange: (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setPreview(URL.createObjectURL(file));
              },
            })}
          />
        </div>

        <div className="flex gap-2 mt-4 ">
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch(resetSingleVideo());
              reset({
                title: singleVideo.title,
                description: singleVideo.description || '',
                thumbnail: null,
              });

              navigate('/myVideos');
            }}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
