import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { initializeSuggestions, loadMoreSuggestions } from '../../features/video/videoSlice';
import formatDuration from '../../utility/formatDuration';
import { fetchAllVideos } from '../../features/video/videoAction';
import timeAgo from '../../utility/timeAgo';

export function SuggestedVideos() {
  const { videoId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { suggestedVideos, homeVideos,hasMoreSuggestions } = useAppSelector(state => state.video);

  // Initialize suggestions whenever the video changes
  useEffect(() => {
    // 1. If we have homeVideos, just initialize the shuffle
    if (videoId && homeVideos.length > 0) {
      dispatch(initializeSuggestions(videoId));
    } 
    // 2. If homeVideos is empty (like after a REFRESH), fetch them first
    else if (videoId && homeVideos.length === 0) {
      // replace 'fetchVideos' with whatever your home-page thunk is called
      dispatch(fetchAllVideos({ page: 1, limit: 30 })).then(() => {
         dispatch(initializeSuggestions(videoId));
      });
    }
  }, [dispatch, videoId,homeVideos.length]);
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Suggested Videos</h2>
      
      <div className="flex flex-col gap-3">
        {suggestedVideos.map((video) => (
          <div 
            key={video._id} 
            onClick={() => navigate(`/watch/${video._id}`)}
            className="flex gap-3 cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className="relative w-40 h-24 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
              <img 
                src={video.thumbnail} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                alt={video.title} 
              />
              <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded">
                {formatDuration(video.duration)}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 overflow-hidden">
              <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                {video.title}
              </h3>
              <p className="text-xs text-neutral-400">@{video.owner?.username}</p>
              <p className="text-[10px] text-neutral-500">{video.viewCount} views • {timeAgo(video.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      {hasMoreSuggestions && (
        <button 
          onClick={() => dispatch(loadMoreSuggestions(videoId))}
          className="w-full py-2 mt-2 text-sm font-semibold text-blue-500 hover:bg-blue-500/10 rounded-full border border-blue-500/20 transition"
        >
          Show more
        </button>
      )}
    </div>
  );
}
