import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay } from "react-icons/fa";



function PlaylistCard({ playlist }) {
  const navigate = useNavigate();
  const videoCount = playlist.videos?.length || 0;

  return (
    <div
      onClick={() => navigate(`/playlists/${playlist._id}`)}
      className="
         cursor-pointer rounded-xl overflow-hidden
        bg-white/5 hover:bg-white/10 transition hover:scale-105
      "
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-700">
        {playlist.coverImage ? (
          <img
            src={playlist.coverImage}
            alt={playlist.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaPlay className="w-10 h-10 text-white/60" />
          </div>
        )}

        {/* Video count overlay */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-xs px-2 py-1 rounded">
          {videoCount} videos
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-white line-clamp-2">
          {playlist.name}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            {playlist.privacy === "private" ? "Private" : "Public"}
          </span>

          <span
            className={`text-xs px-2 py-0.5 rounded ${
              playlist.privacy === "private"
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {playlist.privacy}
          </span>
        </div>
      </div>
    </div>
  );
}
export default memo(PlaylistCard);
