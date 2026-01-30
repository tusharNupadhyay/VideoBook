import { useRef, useEffect, useState } from 'react';
import {
  createPlaylist,
  addVideoToPlaylist,
} from '../features/playlists/playlistAction';
import { useAppDispatch, useAppSelector } from '../app/hooks';

export default function CreatePlaylistModal({ onClose, videoId }) {
  const popupRef = useRef(null); // to close the popupModal when clicked outside,ref stores the popup dom element
  const [title, setTitle] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const dispatch = useAppDispatch();

  const loading = useAppSelector((state) => state.playlist.loading.mutate);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('pointerdown', handleClickOutside);

    //cleanup to prevent memory leakages
    return () =>
      document.removeEventListener('pointerdown', handleClickOutside);
  }, [onClose]);

  const isCreateDisabled = title.trim() === '';
  async function handleCreate() {
    if (isCreateDisabled || loading) return;

    try {
      //create playlist
      const newPlaylist = await dispatch(
        createPlaylist({ name: title.trim(), privacy })
      ).unwrap();
      // add video to newly created playlist
      const playlistId = newPlaylist._id;
      await dispatch(addVideoToPlaylist({ playlistId, videoId })).unwrap();
      onClose();
      console.log('Added video to playlist : ', newPlaylist.name);
    } catch (error) {
      console.error('Create playlist failed: ', error);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/*overlayer with inset-0 to blur bg and popupModal inside it */}
      <div
        ref={popupRef}
        className="w-80 rounded-lg bg-neutral-900 p-3 shadow-xl flex flex-col gap-2"
      >
        <h2 className="mb-4 text-lg font-medium">Create Playlist</h2>

        {/* TITLE INPUT */}
        <input
          type="text"
          value={title}
          placeholder="choose a title"
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded bg-neutral-800 px-3 py-2 outline-none focus:ring-1"
          autoFocus
        />
        {/*Select privacy status */}
        <div className="mt-4 space-y-1">
          <p className="text-sm font-medium text-neutral-300">Privacy Status</p>

          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 pr-8 text-sm
    outline-none focus:ring-1 cursor-pointer"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            
          </select>
         
        </div>
        {/* ACTIONS */}
        <div className=" flex justify-end gap-2">
          <button
            className="px-3 py-1 text-sm text-neutral-300 hover:text-white ring-1 rounded-full"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={isCreateDisabled || loading}
            onClick={handleCreate}
            className={`px-3 py-1 text-sm rounded-full ${
              isCreateDisabled
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                : 'ring-1 text-white'
            }`}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
