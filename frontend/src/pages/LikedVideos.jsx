import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getLikedVideos } from '../features/video/videoAction';
import VideoCard from './VideoCard';
import { useRef } from 'react';
import { toggleVideoReaction } from '../features/video/videoAction';

export default function LikedVideos() {
  const dispatch = useAppDispatch();
  const sentinelRef = useRef(null);

  const { userInfo } = useAppSelector((state) => state.auth);
  const { videos, loading, error, total, page, hasNextPage } = useAppSelector(
    (state) => state.video.likedVideos
  );

  const handleRemoveLike = (videoId) => {
    // We send value 1 because toggling a 1 when it's already 1 results in 'null' (unliked)
    dispatch(toggleVideoReaction({ videoId, value: 1 }));
  };

  //  Initial Fetch (Page 1)
  useEffect(() => {
    if (userInfo && videos.length === 0) {
      dispatch(getLikedVideos({ page: 1 }));
    }
  }, [dispatch, userInfo, videos.length]);

  //  Infinite Scroll Observer
  useEffect(() => {
    if (!userInfo) return;
    //  Capture the current node in a variable
    //this ensures the cleanup function has a reference to the exact DOM node that was being observed.
    const currentSentinel = sentinelRef.current;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !loading) {
        dispatch(getLikedVideos({ page: page + 1 }));
      }
    });

    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      // 2. Use the captured variable for cleanup
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasNextPage, page, loading, dispatch,userInfo]);

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
        <p className="text-sm text-neutral-400">{total} videos</p>
      </header>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
          <p>You haven't liked any videos yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((v) => (
              <VideoCard key={v._id} video={v} onRemove={handleRemoveLike} />
            ))}
          </div>

          {/*  THE SENTINEL: Trigger point for next page */}
          <div
            ref={sentinelRef}
            className="h-20 w-full flex justify-center items-center"
          >
            {loading && videos.length > 0 && (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
