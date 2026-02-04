import { useEffect, useRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import VideoCard from "../../pages/VideoCard"
import { BiVideoOff } from "react-icons/bi";
import { getChannelVideos } from "../../features/video/videoAction";


export default function ProfileVideos({ videos, loading, hasNextPage, page, username }){
    
    const dispatch = useAppDispatch();
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !loading) {
        dispatch(getChannelVideos({ username, page: page + 1 }));
      }
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, page, loading, username, dispatch]);


    return (
    <div className="flex flex-1 flex-col gap-6 p-4 bg-black/90">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {/* Sentinel for Infinite Scroll */}
      <div ref={sentinelRef} className="h-10 w-full flex justify-center">
        {loading && <div className="animate-spin h-6 w-6 border-2 border-t-white rounded-full" />}
      </div>

      {videos.length === 0 && !loading && (
        <p className="text-center text-gray-500">No videos uploaded yet.</p>
      )}
    </div>
  );
}