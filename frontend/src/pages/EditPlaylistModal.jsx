import { useEffect, useRef, useState } from 'react';
import { updatePlaylist,getPlaylistById,getChannelPlaylists } from '../features/playlists/playlistAction';
import { useAppDispatch,useAppSelector } from '../app/hooks';

function EditPlaylistModal({ playlist, onClose }) {
  const popupRef = useRef(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [original, setOriginal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useAppDispatch();
  const {userInfo} = useAppSelector(state => state.auth);
  const channelId = userInfo._id;

  useEffect(() => {
    if (playlist) {
      setTitle(playlist.name || '');
      setDescription(playlist.description || '');
      setPrivacy(playlist.privacy || 'public');

      setOriginal({
        name: playlist.name || '',
        description: playlist.description || '',
        privacy: playlist.privacy || 'public',
      });
    }
  }, [playlist]);

  //close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);

    //cleanup to prevent memory leakages
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  console.log({ playlist });
  const isChanged =
    original &&
    (title !== original.name ||
      description !== original.description ||
      privacy !== original.privacy);

  async function handleSave() {
    if (!isChanged || isSaving) return;

    setIsSaving(true);
    try {
      const playlistId = playlist._id;
      await dispatch(
        updatePlaylist({
          playlistId,
          data: { name: title, description, privacy },
        })
      ).unwrap();
      await dispatch(getPlaylistById({playlistId})).unwrap();
      await dispatch(getChannelPlaylists(channelId)).unwrap();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }
  //backdrop overlay div and then edit modal inside
  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/50 ">
      <div
        ref={popupRef}
        className="bg-neutral-900 text-white w-full max-w-md rounded-xl p-5 "
      >
        <h2 className="text-lg font-semibold mb-4">Edit playlist</h2>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-col mb-2">
            <label className="text-sm text-gray-500">title </label>
            <input
              maxLength={100}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b text-gray-300 outline-none focus:border-b-2 focus:text-white"
            />
          </div>

          <div className="flex flex-col mb-2">
            <label className="text-sm text-gray-500">description </label>
            <textarea
              maxLength={500}
              value={description}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-b text-gray-300 outline-none focus:border-b-2 focus:text-white"
            />
          </div>
          <div className="flex flex-col mb-2">
            <label className="text-sm text-gray-500">privacy </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full mb-4 bg-[#181818] py-1 outline-none border-b  text-gray-300"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer bg-white/10 px-4 py-1 rounded-full"
          >
            Cancel
          </button>
          <button
            disabled={!isChanged || isSaving}
            className={`  px-4 py-1 rounded-full ${!isChanged || isSaving ? "bg-white/5 text-gray-400 cursor-not-allowed": "cursor-pointer bg-white/10"}`}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPlaylistModal;
