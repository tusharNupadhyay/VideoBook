import { useEffect, useRef } from "react";
import { useAppDispatch,useAppSelector } from "../../app/hooks";
import VideoCard from "../../pages/VideoCard"
import { BiVideoOff } from "react-icons/bi";
import { getChannelVideos } from "../../features/video/videoAction";
import { resetChannelVideos } from "../../features/video/videoSlice";


export default function ProfileVideos({ username }){
    
    const dispatch = useAppDispatch();
  const sentinelRef = useRef(null);

  const { videos, loading, hasNextPage, page } = useAppSelector(
    (state) => state.video.channelVideos
  );


  // Handle Initial Fetch & Cleanup when Username changes
  useEffect(() => {
    if (username) {
      dispatch(resetChannelVideos()); // Clear old channel's videos first
      dispatch(getChannelVideos({ username, page: 1 }));
    }
    
    // Cleanup when leaving the page entirely
    return () => {
      dispatch(resetChannelVideos());
    };
  }, [username, dispatch]);

  // Handle Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !loading) {
        dispatch(getChannelVideos({ username, page: page + 1 }));
      }
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) observer.observe(currentSentinel);
    
    return () => {
      if (currentSentinel) observer.disconnect();
    };
  }, [hasNextPage, page, loading, username, dispatch]);


    return (
    <div className="flex flex-1 flex-col gap-6 p-4 bg-black/90">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {/* Sentinel */}
      <div ref={sentinelRef} className="h-10 w-full flex justify-center">
        {loading && <div className="animate-spin h-6 w-6 border-2 border-t-white rounded-full" />}
      </div>

      {videos.length === 0 && !loading && (
        <p className="text-center text-gray-500">No videos uploaded yet.</p>
      )}
    </div>
  );
}