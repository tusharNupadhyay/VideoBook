import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { getChannelProfile } from '../features/user/userActions.js';
import {
  getChannelVideos,
} from '../features/video/videoAction.js';
import { useParams } from 'react-router-dom';
import {
  ProfileHeader,
  ProfileVideos,
} from '../components/index.js';

export default function Channel (){
    

    const {username} = useParams();
    
    const dispatch = useAppDispatch();
    const { channelProfile, channelLoading, channelError } = useAppSelector(state => state.user);
  const { channelVideos, channelLoading: videosLoading, channelError: videosError } = useAppSelector(state => state.video);


  useEffect(() => {
    if (username) {
      dispatch(getChannelProfile(username));
      dispatch(getChannelVideos({ username })); 
    }
  }, [username, dispatch]); 

    if (channelError || videosError) {
    return <div className="p-10 text-center text-red-500">Channel not found or an error occurred.</div>;
  }

  if (channelLoading && !channelProfile) {
    return <div className="p-10 text-white text-center">Loading profile...</div>;
  }

    return (
       <div className="flex flex-col flex-1  min-h-screen ">
      {channelProfile && <ProfileHeader userDetails={channelProfile} />}
      
      
        <div className="border-b border-neutral-700  px-5">
          <button className="pb-2 border-b-2 border-white text-white font-medium">Videos</button>
        </div>
          
        <ProfileVideos videos={channelVideos} loading={videosLoading} />
      </div>
    
    )
}
