import { useEffect, useMemo, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getChannelPlaylists } from '../features/playlists/playlistAction';
import PlaylistCard from './PlaylistCard';

export default function Playlists() {
  const dispatch = useAppDispatch();
  const sentinelRef = useRef(null);

  const { channelPlaylists, loading, error, pagination } = useAppSelector(
    (state) => state.playlist
  );
  const { userInfo } = useAppSelector((state) => state.auth);
  const channelId = userInfo?._id;

  const { page, hasNextPage } = pagination.channelPlaylists;

  // 1. Initial Fetch
  useEffect(() => {
    if (channelId && channelPlaylists.length === 0) {
      dispatch(getChannelPlaylists({ channelId, page: 1 }));
    }
  }, [dispatch, channelId]);

  // 2. Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !loading.fetch) {
        dispatch(getChannelPlaylists({ channelId, page: page + 1 }));
      }
    });

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [dispatch, channelId, hasNextPage, page, loading.fetch]);

  if (error.fetch)
    return <div className="p-6 text-red-500">Failed to load playlists.</div>;

  // const isEmpty = !loading.fetch && channelPlaylists.length===0;

  // if (loading.fetch) return (
  // <div className='flex-1 p-6 text-white'>
  //   <h1 className='text-xl font-semibold mb-4'>Playlists</h1>
  //   <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
  //     {[...Array(6).map((_,i) => (
  //       <div
  //       key={i} className='h-40 rounded-lg bg-white/10 animate-pulse' />
  //     ))]}
  //   </div>
  // </div>)

  return (
    <div className="flex-1 p-6 text-white bg-black/90">
      <h1 className="text-2xl font-semibold mb-6">Playlists</h1>

      {/* Initial Loading Skeleton */}
      {loading.fetch && channelPlaylists.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-video rounded-lg bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : channelPlaylists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-gray-400">
          <p className="text-lg">No playlists yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {channelPlaylists.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={playlist} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div
        ref={sentinelRef}
        className="h-20 w-full flex justify-center items-center"
      >
        {loading.fetch && channelPlaylists.length > 0 && (
          <div className="w-6 h-6 border-2 border-t-blue-500 border-white/20 rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
