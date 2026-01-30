import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getWatchHistory } from '../features/video/videoAction';
import VideoCard from './VideoCard';

export default function WatchHistory() {
  const dispatch = useAppDispatch();

  const { userInfo } = useAppSelector((state) => state.auth);
  const { watchHistory } = useAppSelector((state) => state.video);

  useEffect(() => {
    if (userInfo) dispatch(getWatchHistory());
  }, [userInfo, dispatch]);

  if (WatchHistory?.loading) return <div>Loading watch history...</div>;
  if (WatchHistory?.error)
    return (
      <div className="text-red-500">
        Something went wrong. Please try again later.
      </div>
    );
  return (
    <div className="flex flex-col gap-3 text-white bg-black/90 flex-1 p-3 ">
          <h1 className="text-xl font-semibold mx-auto"> history</h1>
          {watchHistory.videos.length === 0 ? (
            <p className="text-gray-400">There are no liked videos.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {watchHistory.videos.map((v) => (
                <VideoCard key={v._id} video={v} />
              ))}
            </div>
          )}
        </div>
  )
}
