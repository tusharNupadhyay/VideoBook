import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from "../../../app/hooks.js";
import { IoMdAdd } from 'react-icons/io';
import {
  getMyPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from "../../../features/playlists/playlistAction.js";

export default function AddToPlaylistModal({ onClose, onCreateNew, videoId }) {
  const popupRef = useRef(null);
  const sentinelRef = useRef(null); // for scrollabe div pagination

  // store currently updating playlistId to prevent multiple clicks
  const [pendingId, setPendingId] = useState(null);

  const { playlists, loading,pagination } = useAppSelector((state) => state.playlist);
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const channelId = userInfo?._id;
  const { hasNextPage, page } = pagination.myPlaylists;
  

  //close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);

    //cleanup to prevent memory leakages
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 1. Initial Fetch (Page 1)
  useEffect(() => {
    if (channelId) {
      dispatch(getMyPlaylists({ channelId, videoId, page: 1, limit: 10 }));
    }
  }, [dispatch, channelId, videoId]);

  // 2. Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !loading.fetch) {
        dispatch(getMyPlaylists({ 
          channelId, 
          videoId, 
          page: page + 1, 
          limit: 10 
        }));
      }
    });

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, page, loading.fetch, channelId, videoId, dispatch]);

  // Toggle playlist selection
    const handleToggle = async (playlistId, hasVideo) => {
    if (pendingId) return;
    setPendingId(playlistId);

    //since we are not updating redux playlists here , we have to update it in extra reducers
    try {
      if (hasVideo) {
        await dispatch(
          removeVideoFromPlaylist({ playlistId, videoId })
        ).unwrap();
      } else {
        await dispatch(
          addVideoToPlaylist({ playlistId, videoId })
        ).unwrap();
      }
    } finally {
      setPendingId(null);
    }
  };

  return (
   <div
      ref={popupRef}
      className="absolute bottom-full mb-2 w-72 flex flex-col gap-2 p-3 rounded-lg bg-neutral-900 shadow-2xl border border-white/10 z-50"
    >
      <h2 className="text-sm font-semibold text-neutral-300 mb-2">Save to...</h2>

      {/* SCROLLABLE CONTAINER */}
      <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
        {playlists.map((pl) => (
          <label key={pl._id} className="flex items-center gap-3 cursor-pointer group py-1">
            <input
              disabled={pendingId === pl._id}
              type="checkbox"
              checked={!!pl.hasVideo}
              onChange={() => handleToggle(pl._id, pl.hasVideo)}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <span className="text-sm text-neutral-200 group-hover:text-white transition-colors truncate">
              {pl.name}
            </span>
          </label>
        ))}

        {/* LOADING SENTINEL */}
        <div ref={sentinelRef} className="h-4 w-full flex justify-center py-2">
          {loading.fetch && (
            <div className="w-4 h-4 border-2 border-t-blue-500 border-white/20 rounded-full animate-spin" />
          )}
        </div>
        
        {!loading.fetch && playlists.length === 0 && (
          <p className="text-xs text-neutral-500 italic">No playlists found.</p>
        )}
      </div>

      <hr className="border-white/10 my-1" />

      <button
        onClick={onCreateNew}
        className="flex items-center justify-center gap-2 py-2 hover:bg-white/5 rounded-md transition text-sm text-blue-400 font-medium cursor-pointer"
      >
        <IoMdAdd size={18} /> <span>Create new playlist</span>
      </button>
    </div>
  );
}
