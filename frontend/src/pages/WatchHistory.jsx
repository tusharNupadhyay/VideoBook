import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
  getWatchHistory,
  clearWatchHistory,
} from '../features/video/videoAction';
import VideoCard from './VideoCard';

export default function WatchHistory() {
  const dispatch = useAppDispatch();

  const { userInfo } = useAppSelector((state) => state.auth);
  const sentinelRef = useRef(null);
  const { videos, loading, error, total, page, hasNextPage } = useAppSelector(
    (state) => state.video.watchHistory
  );

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear your entire watch history? This cannot be undone.'
    );

    if (!confirmed) return;

    try {
      // .unwrap() turns a rejected action into a thrown error
      await dispatch(clearWatchHistory()).unwrap();
    } catch (err) {
      // Handle the error (e.g., show an alert or toast to the user)
      console.error('Failed to clear history:', err);
      alert(
        'Something went wrong while clearing your history. Please try again.'
      );
    }
  };

  useEffect(() => {
    if (userInfo && videos.length === 0) {
      dispatch(getWatchHistory({ page: 1 }));
    }
  }, [dispatch, userInfo, videos.length]);

  useEffect(() => {
    if (!userInfo) return;
    const currentSentinel = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !loading) {
        dispatch(getWatchHistory({ page: page + 1 }));
      }
    });

    if (currentSentinel) observer.observe(currentSentinel);
    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasNextPage, page, loading, dispatch, userInfo]);

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
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Watch History</h1>
          <p className="text-sm text-neutral-400">{total} videos</p>
        </div>
        {videos.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Clear all history
          </button>
        )}
      </header>
      {videos.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
          <p>Your watch history is empty.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((v) => (
              <VideoCard key={v?._id} video={v} />
            ))}
          </div>

          {/* scrollable sentinel */}
          <div
            ref={sentinelRef}
            className="h-10 w-full flex justify-center items-center mt-4"
          >
            {/* Show a small loader only when fetching the NEXT page */}
            {loading && videos.length > 0 && (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
