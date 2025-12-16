import { VideoCard } from '../components/index.js';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { useEffect } from 'react';
import { fetchAllVideos } from '../features/video/videoAction.js';
import { ErrorPage } from '../pages/index.js';

export default function Home() {
  const dispatch = useAppDispatch();
  const { homeVideos, homeLoading, homeError } = useAppSelector(
    (state) => state.video
  );
  useEffect(() => {
    dispatch(fetchAllVideos());
  }, [dispatch]);
  
  if (homeLoading) return <p>Loading Videos...</p>;
  if (homeError) return <ErrorPage />;
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-black/90  text-white auto-rows-max">
      {homeVideos.length === 0 ? (
        <p>No videos uploaded yet</p>
      ) : (
        homeVideos.map((v) => <VideoCard key={v._id} video={v} />)
      )}
    </div>
  );
}
