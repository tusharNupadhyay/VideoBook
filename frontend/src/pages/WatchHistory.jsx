import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getWatchHistory } from '../features/video/videoAction';
import VideoCard from './VideoCard';

export default function WatchHistory() {
  const dispatch = useAppDispatch();

  const { userInfo } = useAppSelector((state) => state.auth);
  const { videos, loading, error } = useAppSelector((state) => state.video.watchHistory);

  useEffect(() => {
    if (userInfo) dispatch(getWatchHistory());
  }, [userInfo, dispatch]);

  if (loading && videos.length === 0) {
    return <div className="p-6 text-gray-400">Loading watch history...</div>;
  }
  if (error) {
    return (
      <div className="p-6 text-red-500 bg-red-500/10 rounded-lg m-4">
        {error}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6 text-white bg-[#0f0f0f] flex-1 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Watch History</h1>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
          <p>Your watch history is empty.</p>
        </div>
      ) : (
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((v) => (
            <VideoCard key={v._id} video={v} />
          ))}
        </div>
      )}
    </div>
  )
}
