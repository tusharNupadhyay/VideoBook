import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getLikedVideos } from '../features/video/videoAction';
import VideoCard from './VideoCard';

export default function LikedVideos() {
  const dispatch = useAppDispatch();

  const { userInfo } = useAppSelector((state) => state.auth);
  const { videos, loading, error, total } = useAppSelector((state) => state.video.likedVideos);

  useEffect(() => {
    if (userInfo) {
      dispatch(getLikedVideos());
    }
  }, [dispatch, userInfo]);

 if (loading && videos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f0f0f]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Liked Videos</h1>
        <p className="text-sm text-neutral-400">{total || videos.length} videos</p>
      </header>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
          <p>You haven't liked any videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </div>
      )}
    </div>
  );
}

