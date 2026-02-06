import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getMyVideos, deleteVideo } from '../features/video/videoAction';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import ConfirmDelete from './ConfirmDelete';
import { useState } from 'react';
import { Link } from 'react-router-dom';

//Manage my videos (PRIVATE for logged in user)
export default function MyVideos() {
  const dispatch = useAppDispatch();
  const sentinelRef = useRef(null);
  const { videos, page, hasNextPage, total } = useAppSelector(
    (state) => state.video.myVideos
  );
  const { myVideosLoading, myVideosError } = useAppSelector(
    (state) => state.video
  );

  const { userInfo } = useAppSelector((state) => state.auth);

  const [videoToDelete, setVideoToDelete] = useState(null);

  //  Initial Load
  useEffect(() => {
    if (userInfo && videos.length === 0) {
      dispatch(getMyVideos({ page: 1 }));
    }
  }, [dispatch, userInfo]);

  //  Infinite Scroll Observer
  useEffect(() => {
    if (!userInfo) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !myVideosLoading) {
        dispatch(getMyVideos({ page: page + 1 }));
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, page, myVideosLoading, dispatch, userInfo]);

  const handleConfirmDelete = async () => {
    if (videoToDelete) {
      await dispatch(deleteVideo(videoToDelete._id)).unwrap();
      setVideoToDelete(null);
    }
  };

  if (myVideosLoading && !videos.length)
    return <div className="p-10 text-white">Loading dashboard...</div>;
  if (myVideosError)
    return (
      <div className="p-6 text-red-500 bg-red-500/10 rounded-lg m-4">
        {myVideosError}
      </div>
    );

  return (
    <div className="flex-1 bg-[#0f0f0f] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Channel Content</h2>
          <p className="text-neutral-400 text-sm">Total: {total || 0} videos</p>
        </div>

        {/* Header "Table" Row */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
          <div className="col-span-6 md:col-span-7">Video</div>
          <div className="col-span-3 md:col-span-2 text-center">Date</div>
          <div className="col-span-3 md:col-span-3 text-right pr-4">
            Options
          </div>
        </div>

        {videos?.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            You haven't uploaded any videos yet.
          </div>
        ) : (
          <div className="flex flex-col bg-neutral-900/30">
            {videos.map((v) => (
              <ManageVideoRow
                key={v._id}
                video={v}
                onDelete={() => setVideoToDelete(v)}
              />
            ))}
            {/*  The Sentinel */}
            <div
              ref={sentinelRef}
              className="h-10 w-full flex justify-center items-center"
            >
              {myVideosLoading && videos.length > 0 && (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Single Modal for the entire page */}
      <ConfirmDelete
        isOpen={!!videoToDelete}
        title="Delete video"
        message={`Are you sure you want to delete "${videoToDelete?.title}"? This action cannot be undone.`}
        onCancel={() => setVideoToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function ManageVideoRow({ video, onDelete }) {
  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center border-b border-neutral-800 hover:bg-neutral-800/40 transition">
      {/* VIDEO INFO (Thumbnail + Title) */}
      <div className="col-span-6 md:col-span-5 flex gap-4 items-center min-w-0">
        <div className="w-20 aspect-video bg-neutral-800 rounded shrink-0 overflow-hidden border border-neutral-700">
          <img
            src={video.thumbnail}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
        <div className="flex flex-col truncate">
          <span className="text-sm font-medium text-white truncate">
            {video.title}
          </span>

          <span className="text-[10px] uppercase tracking-wider text-green-500 font-bold">
            {video.isPublished ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <div className="hidden md:block col-span-2 text-center text-xs text-neutral-400">
        {video.viewCount?.toLocaleString() || 0} views
      </div>

      {/* DATE */}
      <div className="col-span-3 md:col-span-2 text-center text-xs text-neutral-400">
        {new Date(video.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>

      {/*  ACTIONS */}
      <div className="col-span-3 md:col-span-3 flex justify-end gap-2 pr-2">
        <Link
          to={`/myVideos/edit/${video._id}`}
          className="p-2 text-neutral-400 hover:bg-white/10 hover:text-white rounded-lg transition"
        >
          <FaEdit size={18} />
        </Link>
        <button
          onClick={onDelete}
          className="p-2 text-neutral-400 hover:bg-red-600/20 hover:text-red-500 rounded-lg transition"
        >
          <MdDelete size={18} />
        </button>
      </div>
    </div>
  );
}
