import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { getMyProfile } from '../features/user/userActions.js';
import {
} from '../features/video/videoAction.js';
import {
  ProfileHeader,
  ProfileVideos,
} from '../components/index.js';


export function Profile() {
  const dispatch = useAppDispatch();

  const { myProfileLoading, myProfile, myProfileError } = useAppSelector(
    (state) => state.user
  );
  const { userInfo } = useAppSelector((state) => state.auth);
  const username = userInfo?.username;

  // Fetch channel stats only when the profile page loads AND userInfo exists.
  useEffect(() => {
    if (userInfo) {
      dispatch(getMyProfile());
    }
  }, [userInfo, dispatch]);

  if (myProfileError) {
    return (
      <div className="text-red-500">
        Something went wrong. Please try again later.
      </div>
    );
  }
 if (myProfileLoading && !myProfile) {
  return <div className="text-white p-10">Loading profile details...</div>;
}


  return (
    <div className="flex flex-col flex-1">
      <ProfileHeader userDetails={myProfile} />
      <div className="border-b border-neutral-700  px-5">
          <button className="pb-2 border-b-2 border-white text-white font-medium">Videos</button>
        </div>
      <ProfileVideos 
        username={username}
      />
    </div>
  );
}
