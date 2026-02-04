import { toggleVideoReaction } from '../../features/video/videoAction';
import { BiSolidLike } from 'react-icons/bi';
import { BiSolidDislike } from 'react-icons/bi';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import { toggleSubscription } from '../../features/user/userActions.js';

export function VideoActions({ videoId }) {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const {
    singleVideo: video,
    reactionLoading,
    actionLoading,
    reactions,
  } = useAppSelector((state) => state.video);
  const { subscriptionLoading } = useAppSelector((state) => state.user);
  const isLoggedIn = !!userInfo;
  const disableReactions = !isLoggedIn || reactionLoading || actionLoading;

  const isOwner =
    video?.owner?._id && userInfo?._id && video.owner._id === userInfo._id;
  const channelId = video?.owner?._id;
  const isSubscribed = video?.owner?.isSubscribed;

  // Helper to keep the JSX clean
  const getLikeClass = () => {
    if (!isLoggedIn) return 'opacity-50 cursor-not-allowed bg-neutral-800';
    if (reactionLoading) return 'opacity-50 cursor-wait bg-neutral-700'; // Added loading state
    if (reactions.userReaction === 1) return 'bg-white text-black'; // Active
    return 'text-white hover:bg-neutral-700 bg-neutral-800'; // Default
  };

  const getDislikeClass = () => {
    if (!isLoggedIn) return 'opacity-50 cursor-not-allowed bg-neutral-800';
    if (reactionLoading) return 'opacity-50 cursor-wait bg-neutral-700'; // Added loading state
    if (reactions.userReaction === -1) return 'bg-white text-black'; // Active
    return 'text-white hover:bg-neutral-700 bg-neutral-800'; // Default
  };

  const handleSubscription = async () => {
    if (!isLoggedIn) return;
    try {
      await dispatch(toggleSubscription(channelId)).unwrap();
    } catch (error) {
      console.error('failed to toggle subscription: ', error);
    }
  };

  return (
    <div className="flex text-white text-sm mr-1 items-center gap-3">
      {/*subscribe button*/}
      {!isOwner && (
        <button
          disabled={!isLoggedIn || subscriptionLoading}
          onClick={handleSubscription}
          className={`rounded-full px-6 py-2 transition-all duration-200 font-semibold ${
            !isLoggedIn
              ? 'bg-gray-600 cursor-not-allowed opacity-60'
              : isSubscribed
                ? 'bg-neutral-700 hover:bg-neutral-600 text-white cursor-pointer' // Style for "Subscribed"
                : 'bg-white text-black hover:bg-gray-200 cursor-pointer' // Style for "Subscribe"
          } ${subscriptionLoading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {subscriptionLoading
            ? 'Processing...'
            : !isLoggedIn
              ? 'Sign in to subscribe'
              : isSubscribed
                ? 'Subscribed'
                : 'Subscribe'}
        </button>
      )}

      {/*likes and dislikes button */}
      <div className="flex items-center bg-neutral-800 rounded-full h-10 px-1 border border-white/10 overflow-hidden">
        {/* LIKE BUTTON */}
        <button
          disabled={disableReactions}
          onClick={() => dispatch(toggleVideoReaction({ videoId, value: 1 }))}
          className={`flex items-center gap-2 px-4 h-8 rounded-l-full transition-all duration-200 ${getLikeClass()}`}
        >
          <BiSolidLike className="text-xl" />
          <span className="text-sm font-bold">{reactions.likes}</span>
        </button>

        {/* DIVIDER */}
        <div className="w-1px h-5 bg-neutral-700" />

        {/* DISLIKE BUTTON */}
        <button
          disabled={disableReactions}
          onClick={() => dispatch(toggleVideoReaction({ videoId, value: -1 }))}
          className={`flex items-center px-4 h-8 rounded-r-full transition-all duration-200 ${getDislikeClass()}`}
        >
          <BiSolidDislike className="text-xl" />
        </button>
      </div>
    </div>
  );
}
