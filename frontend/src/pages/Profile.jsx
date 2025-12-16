import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { getMyProfile } from '../features/user/userActions.js';
import {
  getChannelVideos,
} from '../features/video/videoAction.js';
import {
  VideoCard,
  ProfileHeader,
  ProfileVideos,
} from '../components/index.js';

export function Profile() {
  const dispatch = useAppDispatch();

  const { myProfileLoading, myProfile, myProfileError } = useAppSelector(
    (state) => state.user
  );

  const { channelVideos, channelLoading, channelError } = useAppSelector(
    (state) => state.video
  );
  const { userInfo } = useAppSelector((state) => state.auth);

  // Fetch channel stats only when the profile page loads AND userInfo exists.
  useEffect(() => {
    if (userInfo) {
      dispatch(getMyProfile());
      dispatch(getChannelVideos(userInfo.username));
    }
  }, [userInfo, dispatch]);

  if (myProfileError || channelError) {
    return (
      <div className="text-red-500">
        Something went wrong. Please try again later.
      </div>
    );
  }
  if (myProfileLoading || channelLoading) {
    return <div className="text-white">Loading profile...</div>;
  }

  const videoArray = channelVideos?.[0]?.videos;

  return (
    <div className="flex flex-col gap-2 flex-1">
      <ProfileHeader userDetails={myProfile} />
      <ProfileVideos videos={videoArray} />
    </div>
  );
}
