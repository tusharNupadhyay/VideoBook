import { memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import formatDuration from '../utility/formatDuration.js';
import timeAgo from '../utility/timeAgo.js';
import { useAppSelector } from '../app/hooks.js';

// function VideoCard({ video }) {
//   const navigate = useNavigate();
//   const { userInfo } = useAppSelector((state) => state.auth);

//   const handleClick = () => {
//     navigate(`/watch/${video._id}`);
//   };
//   const handleAvatarClick = (e) => {
//     //prevents the parent div's on click
//     e.stopPropagation();
//     // Check if the video owner is the logged-in user
//     const isMe = video.owner?._id === userInfo?._id;
//     if (isMe) navigate('/profile');
//     else navigate(`/channel/${video.owner.username}`);
//   };
//   return (
//     <div
//       onClick={handleClick}
//       className="rounded-xl overflow-hidden bg-black/90  hover:bg-white/10  transition hover:scale-102 cursor-pointer"
//     >
//       {/* Thumbnail */}
//       <div className="relative w-full aspect-video bg-gray-700">
//         <img
//           src={video.thumbnail}
//           alt={video.title}
//           className="w-full h-full object-cover"
//           loading="lazy"
//         />
//         {/* Video count overlay */}
//         <div className="absolute bottom-2 right-2 bg-black/70 text-xs px-2 py-1 rounded">
//           {formatDuration(video.duration)}
//         </div>
//       </div>
//       {/* Content Section */}
//       <div className="flex gap-3 p-3">
//         {/* Clickable Avatar */}
//         <div
//           onClick={handleAvatarClick}
//           className="shrink-0 h-10 w-10 rounded-full overflow-hidden bg-neutral-800 hover:ring-2 hover:ring-blue-500 transition-all"
//         >
//           <img
//             src={video.owner.avatar}
//             alt={video.owner.username}
//             className="h-full w-full object-cover"
//           />
//         </div>

//         {/* Info */}
//         <div className="flex flex-col flex-1 min-w-0">
//           <h3 className="font-semibold text-white line-clamp-2 leading-tight mb-1">
//             {video.title}
//           </h3>

//           {/* Clickable Username */}
//           <p
//             onClick={handleAvatarClick}
//             className="text-gray-400 text-sm hover:text-white transition-colors w-fit"
//           >
//             {video.owner.username}
//           </p>

//           <div className="flex items-center text-sm text-gray-400">
//             <span>{`${video.viewCount} view${video.viewCount !== 1 ? 's' : ''}`}</span>
//             <span className="mx-1">·</span>
//             <span>{timeAgo(video.createdAt)}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

function VideoCard({ video }) {
  const { userInfo } = useAppSelector((state) => state.auth);

  const isMe = video.owner?._id === userInfo?._id;
  const channelPath = isMe ? '/profile' : `/channel/${video.owner?.username}`;

  return (
    <div className="group flex flex-col gap-3 w-full bg-transparent">
      {/* 1. Thumbnail Container */}
      <Link
        to={`/watch/${video._id}`}
        className="relative block aspect-video w-full overflow-hidden rounded-xl bg-neutral-800"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Duration Overlay */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[11px] font-bold text-white">
          {formatDuration(video.duration)}
        </div>
      </Link>

      {/* 2. Details Section */}
      <div className="flex gap-3 px-1">
        {/* Avatar */}
        <Link to={channelPath} className="shrink-0">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10 hover:opacity-80 transition">
            <img
              src={video.owner?.avatar}
              alt={video.owner?.username}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>

        {/* Info */}
        <div className="flex flex-col min-w-0 pr-4">
          <Link to={`/watch/${video._id}`}>
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
              {video.title}
            </h3>
          </Link>

          <div className="mt-1 flex flex-col text-xs text-neutral-400">
            <Link
              to={channelPath}
              className="hover:text-white transition-colors w-fit font-medium"
            >
              {video.owner?.username}
            </Link>
            <div className="flex items-center gap-1 mt-0.5">
              <span>{video.viewCount} views</span>
              <span>•</span>
              <span>{timeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(VideoCard);
