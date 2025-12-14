import { useForm } from 'react-hook-form';
import { uploadVideo } from '../features/video/videoAction';
import { useAppDispatch, useAppSelector } from '../app/hooks';
// import { useNavigate } from 'react-router-dom';
// import { fetchChannelStats } from '../features/user/userActions';
import { clearUploadError } from '../features/video/videoSlice';

export default function Upload() {
  const dispatch = useAppDispatch();
  const { uploadLoading, uploadError } = useAppSelector(
    (state) => state.video
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
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
      const result = await dispatch(uploadVideo(formData)).unwrap(); 
      console.log('video uploaded successfully: ', result);
      reset();
      //  await dispatch(fetchChannelStats()); // refresh data
      //navigate to video page
      // const uploadedVideo = result.data; 
      // Navigate(`/videos/${uploadedVideo._id}`)
     
      
    } catch (error) {
      console.log('Video upload error: ', error);
    }
  };
  return (
    <>
      {uploadError && (
        <div className="text-red-600 p-2 bg-red-100 border border-red-300 rounded mb-4">
          {uploadError}
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-1"
      >
        <label className="font-semibold mb-0">
          {uploadLoading ? 'Uploading Video' : 'Upload Video'}
        </label>
        <input
          type="file"
          accept="video/*"
          className="border p-2"
          multiple={false} //to avoid multiple file selection
          {...register('videoFile', {
            required: 'videoFile is required',
            validate: {
              size: (files) =>
                files[0]?.size < 100 * 1024 * 1024 || 'Max 100MB allowed',
            },
          })}
        />
        {errors.videoFile && (
          <small className="text-red-500 mt-0">
            {errors.videoFile.message}
          </small>
        )}

        <label className="font-semibold mb-0">Thumbnail</label>
        <input
          type="file"
          accept="image/*"
          className="border p-2"
          multiple={false}
          {...register('thumbnail', { required: 'thumbnail is required' })}
        />
        {errors.thumbnail && (
          <small className="text-red-500 mt-0">
            {errors.thumbnail.message}
          </small>
        )}

        <input
          type="text"
          placeholder="video title"
          className="border p-2 w-full"
          {...register('title', { required: 'video title is required' })}
        />
        {errors.title && (
          <small className="text-red-500 mb-0 ">{errors.title.message}</small>
        )}

        <input
          type="text"
          placeholder="description"
          className="border p-2 w-full"
          {...register('description', {
            maxLength: {
              value: 500,
              message: 'Description max 300 characters',
            },
          })}
        />
        {errors.description && (
          <small className="text-red-500 mb-0 ">
            {errors.description.message}
          </small>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={uploadLoading}
        >
          {uploadLoading ? 'Uploading your video...' : 'Publish'}
        </button>
      </form>
    </>
  );
}
