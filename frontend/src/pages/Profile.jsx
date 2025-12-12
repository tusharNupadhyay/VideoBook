import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { fetchChannelStats } from '../features/user/userActions.js';
import VideoCard from '../components/videocard/VideoCard.jsx';

export function Profile() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector((state) => state.user.stats);
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  useEffect(() => {
    if (userInfo) dispatch(fetchChannelStats());
  }, [userInfo, dispatch]);
  if (!userInfo) {
    return <div className="text-white">Loading profile...</div>;
  }

  const createdAt = userInfo?.createdAt;
  const date = createdAt ? new Date(createdAt) : null;
  const formattedDate = date ? date.toLocaleDateString('en-GB') : '';

  console.log('Channel Profile: ', stats);
  const videos = stats?.[0]?.videoDetails?.[0]?.videoArray || [];
  return (
    <div className=" w-full flex flex-col">
      <div className="w-full rounded-lg shadow overflow-hidden">
        {/* Dashboard */}
        <div className="w-full h-48  bg-gray-300 ">
          {/* Cover Image */}
          {userInfo.avatar ? (
            <img
              src={userInfo.avatar}
              alt="coverImage"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-gray-300 w-full h-full" />
          )}
        </div>
        <div className="flex p-2 justify-between items-end bg-gray-300">
          {/* Avatar + User Details */}
          <div className=" flex items-end gap-4">
            <div className="-mt-16">
              <img
                src={userInfo?.avatar}
                alt="avatar"
                className="w-32 h-32 rounded-full border-white object-cover shadow"
              />
            </div>
            {/* Name + username */}
            <div>
              <h2 className="text-2xl text-black font-bold">
                {userInfo?.fullName}
              </h2>
              <p className="text-black">@{userInfo?.username}</p>
              <p className="text-black">
                subscribers:{stats?.[0]?.userDetails?.[0]?.totalSubs}{' '}
              </p>
            </div>
          </div>

          {/* extra info */}
          <div className="text-right space-y-1">
            <p className="text-black">{userInfo?.email}</p>
            <p className="text-black">Joined: {formattedDate}</p>
          </div>
        </div>
      </div>
      <div className="bg-black/90 flex-1 rounded-lg">
        <h2>Published Videos</h2>
        <div className="flex">
          {videos.length > 0 ? (
            videos.map((video) => <VideoCard key={video._id} video={video} />)
          ) : (
            <p>No Videos uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
}
