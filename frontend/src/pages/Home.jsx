import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { useEffect, useRef } from 'react';
import { fetchAllVideos } from '../features/video/videoAction.js';
import { ErrorPage } from '../pages/index.js';
import VideoCard from './VideoCard.jsx';

export default function Home() {
  const dispatch = useAppDispatch();
  const {
    homeVideos,
    homePage,
    hasNextHomePage,
    homeLoading: fetchLoading,
    homeError: fetchError,
  } = useAppSelector((state) => state.video);
  const sentinelRef = useRef(null);

  // Initial Fetch
  useEffect(() => {
    // Only fetch page 1 if we don't already have videos
    // (This prevents re-fetching when navigating back from a video)
    if (homeVideos.length === 0) {
      dispatch(fetchAllVideos({ page: 1, limit: 12 }));
    }
  }, [dispatch]); //don't add homeVideos.length dependency, it will create a retrigger loop

  // 2. Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextHomePage && !fetchLoading) {
          dispatch(fetchAllVideos({ page: homePage + 1, limit: 12 }));
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the sentinel is visible
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [dispatch, hasNextHomePage, homePage, fetchLoading]);

  if (fetchError) return <ErrorPage message={fetchError} />;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 text-white w-full">
      {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on small desktop, 4 on large */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {homeVideos.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </div>

      {/* Empty State */}
      {!fetchLoading && homeVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-gray-400 text-lg font-medium">
            No videos uploaded yet
          </p>
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div
        ref={sentinelRef}
        className="w-full py-10 flex justify-center items-center"
      >
        {fetchLoading && (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading more videos...</p>
          </div>
        )}
      </div>
    </div>
  );
}
