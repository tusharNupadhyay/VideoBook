import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useEffect } from 'react';
import { fetchVideoById } from '../features/video/videoAction';
import ErrorPage from '../pages/ErrorPage.jsx';

export default function Watch() {
  const { videoId } = useParams();
  const dispatch = useAppDispatch();
  const {
    singleVideo: video,
    fetchLoading,
    fetchError,
  } = useAppSelector((state) => state.video);
  useEffect(() => {
    dispatch(fetchVideoById(videoId));
  }, [videoId, dispatch]);
  const handleAddComment = () => {
    console.log('comment added: ');
  };
  if (fetchLoading || !video) return <p>Loading Video...</p>;
  if (fetchError) {
    return <ErrorPage />;
  }
  if (video) console.log('Video Details: ', video);

  const createdAt = video?.createdAt;
  const date = createdAt ? new Date(createdAt) : null;
  const formattedDate = date ? date.toLocaleDateString('en-GB') : '';
  return (
    <div className="bg-black/90 flex w-full gap-2 text-white p-3 overflow-y-auto">
      <div className="flex flex-col gap-2 flex-1 mr-5">
        {/*video player */}
        <video
          src={video.videoFile}
          controls
          className="w-full h-auto bg-black"
        />

        <div className="flex flex-col gap-2">
          {/* title,owner name, subsribe button ,likes ,dislikes,description,etc */}
          <div className=" bg-black flex justify-between rounded-lg p-2">
            {/*title */}
            <p className="text-xl">{video.title}</p>
            <p className="mr-4">Views: {video.viewCount} </p>
          </div>
          <div className="bg-black flex rounded-lg p-2 justify-between">
            <div className="flex gap-2 items-center">
              <img
                src={video.owner.avatar}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex flex-col text-sm font-semibold">
                {/*User's name, subscribers*/}
                <p>{video.owner.username}</p>
                <p>Subscribers: </p>
              </div>
            </div>
            <div className="flex text-white text-sm items-center mr-1 ">
              {/*likes and dislikes buton and subscribes button*/}
              <button className="bg-red-700/80 rounded-4xl px-3 py-2 mr-2 cursor-pointer hover:bg-red-600">
                Subscribe
              </button>
              <button className="bg-red-700/80 rounded-l-full px-3 py-2 cursor-pointer hover:bg-red-600 w-15">
                Like
              </button>
              <button className="bg-red-700/80 rounded-r-full px-3 py-2 cursor-pointer hover:bg-red-600 w-15">
                Dislike
              </button>
            </div>
          </div>
          <div className="bg-black flex flex-col p-2 rounded-lg">
            {/*description */}
            <div className="flex justify-between">
              <p className="text-sm font-semibold">Description</p>
              <p className="text-sm font-semibold mr-4">
                Published : {formattedDate}{' '}
              </p>
            </div>
            <p className="text-sm">{video.description}</p>
          </div>
        </div>
        <div className="bg-black flex-1 rounded-lg p-2 flex flex-col gap-2">
          {/*Comments */}
          <h3>Total comments</h3>
          <div className="flex gap-1 items-center">
            <input
              type="text"
              placeholder="add a comment..."
              className="border p-2 flex-1"
            />
            <button
              onClick={handleAddComment}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {/* Comments by other users */}
            <p>another user comment</p>
            <p>another user comment</p>
            <p>another user comment</p>
            <p>another user comment</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <h2>Suggessted videos</h2>
        <div className="flex flex-col gap-2 bg-black flex-1 w-full items-center rounded-lg"></div>
      </div>
    </div>
  );
}
