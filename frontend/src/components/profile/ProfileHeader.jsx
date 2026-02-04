import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleSubscription } from '../../features/user/userActions';

export default function ProfileHeader({ userDetails }) {
  const { userInfo } = useAppSelector((state) => state.auth);
  const { subscriptionLoading } = useAppSelector((state) => state.user);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  //do not show subscribe button if logged in user is visiting his own profile
  const isLoggedIn = !!userInfo;
  const isOwner = isLoggedIn && userInfo._id === userDetails?._id;
  const isSubscribed = userDetails?.isSubscribed;

  const channelId = userDetails?._id;

  const handleSubscribe = async () => {
    if (isOwner || subscriptionLoading) return;
    if (!isLoggedIn) {
      navigate('/auth/login');
      return;
    }
    try {
      await dispatch(toggleSubscription(channelId)).unwrap();
    } catch (error) {
      console.error('failed to subscribe : ', error);
    }
  };

 if (!userDetails) return <div className="p-8 text-center text-gray-400">Loading Profile...</div>;
  return (
   <div className="p-6 md:p-10 flex flex-col md:flex-row gap-6 items-center text-gray-100  ">
    {/* TODO: cover image  */}
      <img 
        src={userDetails.avatar} 
        alt={userDetails.username} 
        className="w-32 h-32 rounded-full object-cover border-2 border-neutral-700 shadow-xl"
      />

      <div className="flex flex-col items-center md:items-start gap-1 justify-center">
        <h2 className="text-3xl font-bold">{userDetails.username}</h2>
        
        <div className="flex gap-2 text-sm text-neutral-400 mb-2">
          <span>@{userDetails.username.toLowerCase()}</span>
          <span>•</span>
          <span>{userDetails.totalSubscribers || 0} {userDetails.totalSubscribers!==1 ? "subscribers" : "subscriber"}</span>
        </div>

        {/* Action Button: Either 'Edit Profile' or 'Subscribe' */}
        {isOwner ? (
          <button 
            onClick={() => navigate('/myProfile/edit')}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full font-medium transition"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={subscriptionLoading}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
              isSubscribed 
                ? "bg-neutral-800 text-white hover:bg-neutral-700" 
                : "bg-white text-black hover:bg-gray-200"
            } ${subscriptionLoading ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
          >
            {subscriptionLoading ? "Processing..." : isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        )}
      </div>
    </div>
  );
}
