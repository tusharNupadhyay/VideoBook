import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export function OwnerSection({ owner }) {
  const { userInfo } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    // Check if the video owner is the logged-in user
    const isMe = owner?._id === userInfo?._id;
    if (isMe) navigate('/profile');
    else navigate(`/channel/${owner?.username}`);
  };

  return (
    <div className="flex gap-2 items-center">
      <img
        src={owner.avatar}
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover  hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
        onClick={handleAvatarClick}
      />
      <div className="flex flex-col text-sm font-semibold">
        {/*User's name, subscribers*/}
        <p className="font-bold text-base leading-tight cursor-pointer" onClick={handleAvatarClick}>{owner.username}</p>
        <p className="text-xs text-neutral-400 font-medium">Subscribers: {owner.subscribersCount} </p>
      </div>
    </div>
  );
}
