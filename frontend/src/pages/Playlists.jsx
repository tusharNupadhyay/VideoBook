import { useEffect,useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getChannelPlaylists } from '../features/playlists/playlistAction';
import PlaylistCard from './PlaylistCard';

export default function Playlists() {
  const dispatch = useAppDispatch();
  const { channelPlaylists, loading, error } = useAppSelector(
    (state) => state.playlist
  );

  const { userInfo } = useAppSelector((state) => state.auth);
  const channelId = userInfo?._id;

  useEffect(() => {
    if (channelId && channelPlaylists.length === 0) dispatch(getChannelPlaylists(channelId));
  }, [dispatch, channelId,channelPlaylists]);

  const isEmpty = !loading.fetch && channelPlaylists.length===0;


  if (loading.fetch) return (
  <div className='flex-1 p-6 text-white'>
    <h1 className='text-xl font-semibold mb-4'>Playlists</h1>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {[...Array(6).map((_,i) => (
        <div 
        key={i} className='h-40 rounded-lg bg-white/10 animate-pulse' />
      ))]}
    </div>
  </div>)

  if (error.fetch)
    return (
      <div className="flex-1 p-6 text-red-500">
        failed to load playlists. Please try again later.
      </div>
    );

  return (
    <div className="flex-1 p-6 text-white bg-black/90">
      <h1 className="text-2xl font-semibold mb-6">Playlists</h1>
       {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-60 text-gray-400">
          <p className="text-lg">No playlists yet</p>
          <p className="text-sm">
            Create playlists to organize your videos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {channelPlaylists.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
