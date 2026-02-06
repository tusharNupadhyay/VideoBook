import { useState } from 'react';
import { useAppSelector } from "../../../app/hooks.js";
import { CiSaveDown2 } from 'react-icons/ci';
import AddToPlaylistModal from './AddToPlaylistModal.jsx';
import CreatePlaylistModal from './CreatePlaylistModal.jsx';

export function VideoPlaylist({ videoId, viewCount }) {
  const { userInfo } = useAppSelector((state) => state.auth);

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isLoggedIn = !!userInfo; //converts to boolean

  return (
    <div className="relative flex gap-2 mr-4 items-center">
      <button
        disabled={!isLoggedIn}
        //prevent this click from reaching the document listener
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setIsSaveOpen((prev) => !prev)}
        className="flex gap-1 items-center cursor-pointer bg-neutral-800 px-2 py-1 rounded-full"
      >
        <CiSaveDown2 /> <span>Save</span>
      </button>
      {/* FLOATING SAVE POPUP */}
      {isSaveOpen && (
        <AddToPlaylistModal
        key={videoId}
          videoId={videoId}
          onClose={() => setIsSaveOpen(false)}
          onCreateNew={() => {
            setIsSaveOpen(false);
            setIsCreateOpen(true);
          }}
        />
      )}
      {/* CREATE PLAYLIST MODAL */}
      {isCreateOpen && (
        <CreatePlaylistModal
          videoId={videoId}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
      <p>Views: {viewCount} </p>
    </div>
  );
}
