import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useEffect } from 'react';
import {
  fetchVideoById,
  getVideoReactions,
  toggleVideoReaction,
} from '../features/video/videoAction';
import { fetchCommentsByVideo } from '../features/comments/commentAction.js';
import ErrorPage from '../pages/ErrorPage.jsx';
import { BiSolidLike } from 'react-icons/bi';
import { BiSolidDislike } from 'react-icons/bi';
import {CommentSection} from "../components/index.js";

export default function Watch() {


  const { videoId } = useParams();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const {
    singleVideo: video,
    fetchLoading,
    fetchError,
    reactionLoading,
    actionLoading,
    reactions,
  } = useAppSelector((state) => state.video);

  const isOwner =
    video?.owner?._id && userInfo?._id && video.owner._id === userInfo._id;

  const isLoggedIn = !!userInfo;
  const disableReactions =
    !isLoggedIn || reactionLoading || actionLoading;

  useEffect(() => {
    dispatch(fetchVideoById(videoId));
    dispatch(getVideoReactions(videoId));
    dispatch(fetchCommentsByVideo(videoId));
  }, [videoId, dispatch]);

  if (fetchLoading || !video) return <p>Loading Video...</p>;
  if (fetchError) {
    return <ErrorPage />;
  }
  if (video) console.log('Video Details: ', video);

  const createdAt = video?.createdAt;
  const date = createdAt ? new Date(createdAt) : null;
  const formattedDate = date ? date.toLocaleDateString('en-GB') : '';
  return (
    <div className="bg-black/90 flex w-full gap-2 text-white overflow-y-auto p-2">
      <div className="flex flex-col gap-2 mr-5 border-2 max-w-4xl">
        {/*video player */}
        <video
          src={video.videoFile}
          controls
          className="w-full h-auto bg-black rounded-lg"
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
        <CommentSection videoId={videoId}/>
        
      </div>
      <div className="flex flex-col gap-2 items-center">
        <h2>Suggessted videos</h2>
        <div className="flex flex-col gap-2 bg-black flex-1 w-full items-center rounded-lg"></div>
      </div>
    </div>
  );
}
