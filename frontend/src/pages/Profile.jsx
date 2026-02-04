import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { getMyProfile } from '../features/user/userActions.js';
import {
  getChannelVideos,
} from '../features/video/videoAction.js';
import {
  ProfileHeader,
  ProfileVideos,
} from '../components/index.js';
import { resetChannelVideos } from '../features/video/videoSlice.js';

export function Profile() {
  const dispatch = useAppDispatch();

  const { myProfileLoading, myProfile, myProfileError } = useAppSelector(
    (state) => state.user
  );

  const { channelVideos, channelLoading, channelError,hasNextChannelPage, 
    channelPage, } = useAppSelector(
    (state) => state.video
  );
  const { userInfo } = useAppSelector((state) => state.auth);
  const username = userInfo?.username;

  // Fetch channel stats only when the profile page loads AND userInfo exists.
  useEffect(() => {
    if (userInfo) {
      dispatch(getMyProfile());
      dispatch(getChannelVideos({ username, page: 1 }));//initial load
    }
    // CLEANUP: This only runs when the user leaves the Profile page
    return () => {
      dispatch(resetChannelVideos()); 
    };
  }, [userInfo, dispatch]);

  if (myProfileError || channelError) {
    return (
      <div className="text-red-500">
        Something went wrong. Please try again later.
      </div>
    );
  }
 if (myProfileLoading && !myProfile) {
  return <div className="text-white p-10">Loading profile details...</div>;
}

//  Don't show full-page loader if we already have some videos
if (channelLoading && channelVideos.length === 0) {
  return <div className="text-white p-10">Loading videos...</div>;
}

  console.log({channelVideos});

  return (
    <div className="flex flex-col gap-2 flex-1">
      <ProfileHeader userDetails={myProfile} />
      <ProfileVideos 
        videos={channelVideos} 
        loading={channelLoading} 
        hasNextPage={hasNextChannelPage}
        page={channelPage}
        username={username}
      />
    </div>
  );
}
