import { useState } from 'react';
import { deletePlaylist,getChannelPlaylists } from '../features/playlists/playlistAction';
import { useAppDispatch,useAppSelector } from '../app/hooks';
import { useNavigate } from 'react-router-dom';

export default function ConfirmPlaylistDelete({ playlistId, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const dispatch = useAppDispatch();
  const {userInfo} = useAppSelector(state => state.auth);
  const channelId = userInfo._id;
  const navigate = useNavigate();

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await dispatch(deletePlaylist({ playlistId })).unwrap();
      await dispatch(getChannelPlaylists(channelId)).unwrap();
      onClose();
      navigate('/playlists');
    } catch (error) {
      console.error('failed to delete the playlist : ', error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="z-50 inset-0 fixed flex items-center justify-center bg-black/50">
      <div className="bg-neutral-900 text-white w-full max-w-md rounded-xl p-5 flex flex-col gap-5 items-center">
        <h2>Are you sure you want to delete the playlist ?</h2>
        <div className='flex gap-3 justify-center'>
          <button
            className={` rounded-full px-4 py-1 ${isDeleting ? 'cursor-not-allowed bg-white/5' : 'cursor-pointer bg-white/10'}`}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? 'Deleting...' : 'Yes'}
          </button>
          <button
            className="cursor-pointer bg-white/10 px-4 py-1 rounded-full"
            disabled={isDeleting}
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
