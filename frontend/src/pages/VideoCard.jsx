import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import formatDuration from '../utility/formatDuration.js';
import timeAgo from '../utility/timeAgo.js';

function VideoCard({ video }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/watch/${video._id}`);
  };

  console.log({video});
  return (
    <div
      onClick={handleClick}
      className="rounded-xl overflow-hidden  bg-white/5 hover:bg-white/10  transition hover:scale-102 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-700">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
         {/* Video count overlay */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="flex flex-col p-2">
        <h3 className="font-semibold text-white line-clamp-2">{video.title}</h3>

        <p className="text-gray-400">{video.owner.username}</p>

        <div className="flex items-center text-sm text-gray-400  gap-2">
          <span>{`${video.viewCount} view${video.viewCount!==1 ? "s" : ""}`}</span>
          <span className="mx-1 text-xl">·</span>
          <span>{timeAgo(video.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(VideoCard);
