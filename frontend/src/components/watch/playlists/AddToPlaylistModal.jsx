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
  // store currently updating playlistId to prevent multiple clicks
  const [pendingId, setPendingId] = useState(null);

  const { playlists, loading } = useAppSelector((state) => state.playlist);
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const channelId = userInfo?._id;
  

  //close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);

    //cleanup to prevent memory leakages
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Fetch playlists every time modal opens
  useEffect(() => {
    if (channelId) dispatch(getMyPlaylists({ channelId, videoId }));
  }, [dispatch, channelId, videoId]);

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
      className=" absolute bottom-full  mb-2 w-72 flex flex-col gap-2 p-2 rounded bg-neutral-900 shadow-xl"
    >
      <h2>Add to playlist</h2>
      {loading.fetch && (
        <p className="text-sm text-neutral-400">Loading playlists...</p>
      )}

      {!loading.fetch && playlists.length === 0 && (
        <p className="text-sm text-neutral-400">You don't have playlists yet</p>
      )}

      {!loading.fetch &&
        playlists.map((pl) => (
          <label
            key={pl._id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              disabled={pendingId === pl._id}
              type="checkbox"
              checked={!!pl.hasVideo}
              onChange={() => handleToggle(pl._id,pl.hasVideo)}
            />
            <span>{pl.name}</span>
          </label>
        ))}

      <button
        onClick={onCreateNew}
        className="flex items-center justify-center gap-1 bg-neutral-800 rounded w-full cursor-pointer"
      >
        <IoMdAdd /> <span>Create</span>
      </button>
    </div>
  );
}
