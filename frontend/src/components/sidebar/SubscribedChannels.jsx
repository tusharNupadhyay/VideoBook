import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export default function SubscribedChannels({ channel, sidebarOpen }) {
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  const handleProfile = () => {
   if (!userInfo) {
      navigate('/auth/login');
    } else {
      navigate(`/channel/${channel.username}`);
    }
  };
  return (
    <div
      onClick={handleProfile}
      className="flex w-full items-center gap-4 p-2 hover:bg-neutral-800 rounded-lg cursor-pointer transition-all overflow-hidden whitespace-nowrap"
    >
      <img
        src={channel.avatar}
        className="w-8 h-8 rounded-full object-cover shrink-0"
        alt="profile"
      />
      {sidebarOpen && (
        <span className=" truncate text-gray-300">{channel.username}</span>
      )}
    </div>
  );
}
