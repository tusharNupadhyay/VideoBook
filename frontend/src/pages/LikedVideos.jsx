import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getLikedVideos } from '../features/video/videoAction';
import VideoCard from './VideoCard';

export default function LikedVideos() {
  const dispatch = useAppDispatch();

  const { userInfo } = useAppSelector((state) => state.auth);
  const { likedVideos } = useAppSelector((state) => state.video);

  useEffect(() => {
    if (userInfo) {
      dispatch(getLikedVideos());
    }
  }, [userInfo, dispatch]);

  if (likedVideos?.loading) return <div>Loading watch history...</div>;
  if (likedVideos?.error)
    return (
      <div className="text-red-500">
        Something went wrong. Please try again later.
      </div>
    );
  return (
    <div className="flex flex-col gap-3 text-white bg-black/90 flex-1 p-3 ">
      <h1 className="text-xl font-semibold">Liked Videos</h1>
      {likedVideos.videos.length === 0 ? (
        <p className="text-gray-400">There are no liked videos.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {likedVideos.videos.map((v) => (
            <VideoCard key={v._id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}

