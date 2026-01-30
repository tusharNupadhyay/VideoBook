import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getPlaylistById } from '../features/playlists/playlistAction';
import VideoCard from './VideoCard';
import PlaylistMenu from '../components/playlist/PlaylistMenu';
import EditPlaylistModal from './EditPlaylistModal';
import ConfirmPlaylistDelete from './ConfirmPlaylistDelete';
import { FaPlay } from "react-icons/fa";

function PlaylistDetails() {
  const { playlistId } = useParams();
  const dispatch = useAppDispatch();

  const currentPlaylist = useAppSelector(
    (state) => state.playlist.currentPlaylist
  );
  const loading = useAppSelector(
    (state) => state.playlist.loading
  );
  const error = useAppSelector(
    (state) => state.playlist.error
  );
  const { userInfo } = useAppSelector((state) => state.auth);

  //for playlist edit modal
  const [isOpen,setIsOpen] = useState(false);
  // confirm playlist delete modal
  const [isDelete,setIsDelete] = useState(false);

  useEffect(() => {
    dispatch(getPlaylistById({ playlistId }));
  }, [playlistId, dispatch]);

  if (loading.fetch) {
    return (
      <div className="flex-1 p-6 text-white">
        <div className="h-40 bg-white/10 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error.fetch) {
    return (
      <div className="flex-1 p-6 text-red-500">Failed to load playlist</div>
    );
  }

  if (!currentPlaylist) return null; // to avoid cannot read properties of null
  const isOwner = currentPlaylist.playlist.owner?._id === userInfo?._id;
  const { playlist, videos, pagination } = currentPlaylist;
  return (
    <div className="flex-1 p-6 text-white bg-black/90 flex flex-col gap-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover */}
        <div className="relative w-full md:w-72 aspect-video bg-gray-700 rounded-xl overflow-hidden shrink-0">
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaPlay className="w-12 h-12 text-white/60" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex justify-between gap-4 w-full relative">
          <div className='flex flex-col justify-around'>
            <h1 className="text-2xl font-bold">
              {playlist.name}
            </h1>
            <p className="text-gray-400">
              videos: {pagination.total}
            </p>
            <p className="text-sm text-gray-500">
              By {playlist.owner.username}
            </p>

            <span
              className={`px-2 py-0.5 rounded text-xs ${
                playlist.privacy === 'private'
                  ? ' text-red-400'
                  : ' text-green-400'
              }`}
            >
              {playlist.privacy}
            </span>
          </div>
          {isOwner && (
            <PlaylistMenu
              onEdit={() => {
                console.log('Edit playlist');
                setIsOpen(true);
              }}
              onDelete={() => {
                setIsDelete(true);
                console.log('are you sure you want to Delete Playlist');
              }}
            />
          )}
          {isOwner && isOpen && (<EditPlaylistModal playlist={playlist} onClose={()=> setIsOpen(false)}/>)}
            {isOwner && isDelete && (<ConfirmPlaylistDelete playlistId={playlist._id} onClose={()=> setIsDelete(false)} />)}
        </div>
      </div>

      {/* ===== VIDEOS ===== */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Videos</h2>

        {videos?.length === 0 ? (
          <p className="text-gray-400">This playlist has no videos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(PlaylistDetails);
