import { useAppSelector } from '../app/hooks.js';
export function Profile() {
  const { userInfo } = useAppSelector((state) => state.auth);
  const createdAt = userInfo.createdAt;
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString('en-GB');
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
                src={userInfo.avatar}
                alt="avatar"
                className="w-32 h-32 rounded-full border-white object-cover shadow"
              />
            </div>
            {/* Name + username */}
            <div>
              <h2 className="text-2xl font-bold">{userInfo.fullName}</h2>
              <p className="text-black">@{userInfo.username}</p>
              <p className="text-black">subscribers: </p>
            </div>
          </div>

          {/* extra info */}
          <div className="text-right space-y-1">
            <p className="text-black">{userInfo.email}</p>
            <p className="text-black">Joined: {formattedDate}</p>
          </div>
        </div>
      </div>
      <div className='bg-black/90 flex-1 rounded-lg'>

      </div>
    </div>
  );
}
