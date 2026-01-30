import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getMyVideos,deleteVideo } from '../features/video/videoAction';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import ConfirmDelete from './ConfirmDelete';
import { useState } from 'react';
import { Link } from 'react-router-dom';

//Manage my videos (PRIVATE for logged in user)
export default function MyVideos() {
  const dispatch = useAppDispatch();

  const { userInfo } = useAppSelector((state) => state.auth);

  const { myVideos, myVideosLoading, myVideosError } = useAppSelector(
    (state) => state.video
  );

  useEffect(() => {
    if (userInfo) dispatch(getMyVideos());
  }, [userInfo, dispatch]);
  console.log({ myVideos });

  if (myVideosError) {
    return (
      <div className="text-red-500">
        Something went wrong. Please try again later.
      </div>
    );
  }
  if (myVideosLoading) {
    return <div className="text-white">Loading videos...</div>;
  }
  return (
    <div className="bg-black/90 flex flex-1 flex-col gap-2 text-white ">
      <h2 className="text-white text-xl p-2 mx-auto">Your Videos</h2>
      <div className=" rounded-md px-4 py-2 flex items-center justify-between shadow mx-20">
        <p className="text-white p-4 ">Total Videos : {myVideos?.total}</p>
        <div className="flex gap-2 ">
          <p className='mr-10'>Edit</p>
          <p className='mr-10'>Delete</p>
        </div>
      </div>

      {myVideos?.videos?.length === 0 ? (
        <p>No videos uploaded yet</p>
      ) : (
        <div className="flex flex-col gap-2 p-2 flex-1">
          {' '}
          {myVideos?.videos?.map((v) => (
            <ManageVideos key={v._id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function ManageVideos({ video }) {
    const [showConfirm, setShowConfirm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
const dispatch = useAppDispatch();
  const handleDeleteClick = (video) => {
    setSelectedVideo(video);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    console.log("Deleting:", selectedVideo.id);
    dispatch(deleteVideo(selectedVideo._id));
    setShowConfirm(false);
    setSelectedVideo(null);
  };

  return (
    <>
    <div className="bg-white rounded-md px-4 py-2 flex items-center justify-between shadow text-gray-800 mx-20">
      <h3 className="text-sm font-medium  truncate">{video.title}</h3>
      <div className="flex gap-2 ">
        <button
          aria-label="Edit video"
          title="Edit"
          className="hover:cursor-pointer hover:scale-110 transition mr-10"
        >
            <Link to={`/myVideos/edit/${video._id}`}>
          <FaEdit size={22} />
          </Link>
        </button>
        <button 
         onClick={() => handleDeleteClick(video)}
        aria-label="Delete video"
          title="Delete" className="hover:cursor-pointer hover:scale-110 transition mr-10">
        <MdDelete size={22} />

      </button>
      </div>
    </div>
    <ConfirmDelete
        isOpen={showConfirm}
        title="Delete video"
        message={
          selectedVideo
            ? `Are you sure you want to delete "${selectedVideo.title}"?`
            : ""
        }
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
      /></>
  );
}
