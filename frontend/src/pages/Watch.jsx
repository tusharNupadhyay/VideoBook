import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useEffect } from 'react';
import {
  fetchVideoById,
  getVideoReactions,
  toggleVideoReaction,
} from '../features/video/videoAction';
import ErrorPage from '../pages/ErrorPage.jsx';
import { BiSolidLike } from 'react-icons/bi';
import { BiSolidDislike } from 'react-icons/bi';

export default function Watch() {
  const { videoId } = useParams();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const {
    singleVideo: video,
    fetchLoading,
    fetchError,
    reactionLoading,
    reactionActionLoading,
    reactions,
  } = useAppSelector((state) => state.video);

  const isOwner =
    video?.owner?._id && userInfo?._id && video.owner._id === userInfo._id;

  const isLoggedIn = !!userInfo;
  const disableReactions =
    !isLoggedIn || reactionLoading || reactionActionLoading;

  useEffect(() => {
    dispatch(fetchVideoById(videoId));
    dispatch(getVideoReactions(videoId));
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
            <div className="flex text-white text-sm mr-1 items-center gap-3">
              {/*likes and dislikes buton and subscribes button*/}
              {!isOwner && (
                <button
                  disabled={!isLoggedIn}
                  className={`rounded-full px-4 py-2 mr-2 transition ${
                    !isLoggedIn
                      ? 'bg-gray-600 cursor-not-allowed opacity-60'
                      : 'bg-red-700/80 hover:bg-red-600'
                  } `}
                >
                  {isLoggedIn ? 'Subscribe' : 'Sign in to subscribe'}
                </button>
              )}
              <div className="flex items-center bg-red-700/80 rounded-full overflow-hidden">
                <button
                  disabled={disableReactions}
                  className={`inline-flex ${
                    !isLoggedIn
                      ? 'bg-gray-600 cursor-not-allowed opacity-60'
                      : 'bg-red-700/80 hover:bg-red-600'
                  }  items-center gap-1 px-4 py-2 transition ${reactionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'} ${reactions.userReaction === 1 ? 'bg-red-600' : 'bg-red-700/80'}`}
                  onClick={() =>
                    dispatch(toggleVideoReaction({ videoId, value: 1 }))
                  }
                >
                  <BiSolidLike className="text-lg" />{' '}
                  <span>{reactions.likes}</span>
                </button>

                <button
                  disabled={disableReactions}
                  className={`inline-flex ${
                    !isLoggedIn
                      ? 'bg-gray-600 cursor-not-allowed opacity-60'
                      : 'bg-red-700/80 hover:bg-red-600'
                  } items-center gap-1 px-4 py-2 transition  ${reactionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'} ${reactions.userReaction === -1 ? 'bg-red-600' : 'bg-red-700/80'}`}
                  onClick={() =>
                    dispatch(toggleVideoReaction({ videoId, value: -1 }))
                  }
                >
                  <BiSolidDislike className="text-lg" />
                  <span>{reactions.dislikes}</span>
                </button>
              </div>
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
