import { memo, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getPlaylistById } from '../features/playlists/playlistAction';
import VideoCard from './VideoCard';
import PlaylistMenu from '../components/playlist/PlaylistMenu';
import EditPlaylistModal from './EditPlaylistModal';
import ConfirmPlaylistDelete from './ConfirmPlaylistDelete';
import { FaPlay } from 'react-icons/fa';
import { IoLockClosedOutline } from 'react-icons/io5';
import { resetCurrentPlaylist } from '../features/playlists/playlistSlice';
import { removeVideoFromPlaylist } from '../features/playlists/playlistAction';


function PlaylistDetails() {
  const { playlistId } = useParams();
  const dispatch = useAppDispatch();
  const sentinelRef = useRef(null);

  const { currentPlaylist, loading, error, pagination } = useAppSelector(
    (state) => state.playlist
  );
  const { userInfo } = useAppSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  //remove video from playlist
  const handleRemoveVideo = (videoId) => {
  // We already have playlistId from useParams()
  dispatch(removeVideoFromPlaylist({ playlistId, videoId }));
};

  // 1. Initial Load & Cleanup
  useEffect(() => {
    dispatch(getPlaylistById({ playlistId, page: 1 }));
    return () => {
      dispatch(resetCurrentPlaylist());
    };
  }, [playlistId, dispatch]);

  // 2. Video Pagination Observer
  const { hasNextPage, page } = pagination.currentPlaylist;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !loading.fetch) {
        dispatch(getPlaylistById({ playlistId, page: page + 1 }));
      }
    });

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [dispatch, playlistId, hasNextPage, page, loading.fetch]);

  // Handle Loading & Error States
  if (loading.fetch && !currentPlaylist.metadata) {
    return <div className="flex-1 p-6 text-white animate-pulse">Loading playlist...</div>;
  }
  if (error.fetch) return <div className="flex-1 p-6 text-red-500">Failed to load playlist</div>;

  const { metadata, videos } = currentPlaylist;
  const isOwner = metadata?.owner?._id === userInfo?._id;

  // Private Playlist Check
  if (metadata?.privacy === 'private' && !isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-white">
        <IoLockClosedOutline size={60} className="text-gray-500 mb-4" />
        <h2 className="text-xl font-bold">This playlist is private</h2>
      </div>
    );
  }
  return (
    <div className="flex-1 p-6 text-white bg-black/90 flex flex-col gap-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row gap-6 border-b border-white/10 pb-8">
        <div className="relative w-full md:w-72 aspect-video bg-neutral-800 rounded-xl overflow-hidden shrink-0">
          {metadata?.coverImage ? (
            <img src={metadata.coverImage} alt={metadata.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><FaPlay className="w-12 h-12 text-white/20" /></div>
          )}
        </div>

        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{metadata?.name}</h1>
            <p className="text-gray-400 text-sm">{pagination.currentPlaylist.total} videos • By {metadata?.owner?.username}</p>
            <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              metadata?.privacy === 'private' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {metadata?.privacy}
            </span>
          </div>

          {isOwner && (
            <PlaylistMenu onEdit={() => setIsOpen(true)} onDelete={() => setIsDelete(true)} />
          )}
        </div>
      </div>

      {/* ===== VIDEOS GRID ===== */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} onRemove={handleRemoveVideo} />
          ))}
        </div>

        {/* Sentinel for Video Pagination */}
        <div ref={sentinelRef} className="h-20 w-full flex justify-center items-center">
          {loading.fetch && videos.length > 0 && (
            <div className="w-6 h-6 border-2 border-t-blue-500 border-white/20 rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Modals */}
      {isOwner && isOpen && <EditPlaylistModal playlist={metadata} onClose={() => setIsOpen(false)} />}
      {isOwner && isDelete && <ConfirmPlaylistDelete playlistId={metadata?._id} onClose={() => setIsDelete(false)} />}
    </div>
  );
  // return (
  //   <div className="flex-1 p-6 text-white bg-black/90 flex flex-col gap-8">
  //     {/* ===== HEADER ===== */}
  //     <div className="flex flex-col md:flex-row gap-6">
  //       {/* Cover */}
  //       <div className="relative w-full md:w-72 aspect-video bg-gray-700 rounded-xl overflow-hidden shrink-0">
  //         {playlist?.coverImage ? (
  //           <img
  //             src={playlist?.coverImage}
  //             alt={playlist?.name}
  //             className="w-full h-full object-cover"
  //           />
  //         ) : (
  //           <div className="w-full h-full flex items-center justify-center">
  //             <FaPlay className="w-12 h-12 text-white/60" />
  //           </div>
  //         )}
  //       </div>

  //       {/* Info */}
  //       <div className="flex justify-between gap-4 w-full relative">
  //         <div className="flex flex-col justify-around">
  //           <h1 className="text-2xl font-bold">{playlist.name}</h1>
  //           <p className="text-gray-400">videos: {pagination?.total}</p>
  //           <p className="text-sm text-gray-500">
  //             By {playlist?.owner?.username}
  //           </p>

  //           <span
  //             className={`px-2 py-0.5 rounded text-xs ${
  //               playlist.privacy === 'private'
  //                 ? ' text-red-400'
  //                 : ' text-green-400'
  //             }`}
  //           >
  //             {playlist?.privacy}
  //           </span>
  //         </div>
  //         {isOwner && (
  //           <PlaylistMenu
  //             onEdit={() => {
  //               console.log('Edit playlist');
  //               setIsOpen(true);
  //             }}
  //             onDelete={() => {
  //               setIsDelete(true);
  //               console.log('are you sure you want to Delete Playlist');
  //             }}
  //           />
  //         )}
  //         {isOwner && isOpen && (
  //           <EditPlaylistModal
  //             playlist={playlist}
  //             onClose={() => setIsOpen(false)}
  //           />
  //         )}
  //         {isOwner && isDelete && (
  //           <ConfirmPlaylistDelete
  //             playlistId={playlist._id}
  //             onClose={() => setIsDelete(false)}
  //           />
  //         )}
  //       </div>
  //     </div>

  //     {/* ===== VIDEOS ===== */}
  //     <div className="flex flex-col gap-4">
  //       <h2 className="text-xl font-semibold">Videos</h2>

  //       {videos?.length === 0 ? (
  //         <p className="text-gray-400">This playlist has no videos.</p>
  //       ) : (
  //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
  //           {videos.map((video) => (
  //             <VideoCard key={video?._id} video={video} />
  //           ))}
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
}

export default memo(PlaylistDetails);
