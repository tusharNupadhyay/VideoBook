import { useEffect, useState } from 'react';
import { BsLayoutSidebarInset } from 'react-icons/bs';
import { FaHome } from 'react-icons/fa';
import { MdAccountCircle } from 'react-icons/md';
import { useAppSelector } from '../../app/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineVideoSettings } from 'react-icons/md';
import { AiFillLike } from 'react-icons/ai';
import { MdHistory } from 'react-icons/md';
import { CgPlayListSearch } from 'react-icons/cg';
import SubscriptionsList from './SubscriptionsList';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { userInfo } = useAppSelector((state) => state.auth);

  const location = useLocation(); // This gives us the current URL object

  // This effect runs every time the URL path changes
  useEffect(() => {
    
    //to prevent react warning, use setTimeout
    const timer = setTimeout(() => {
      // Only close if it's currently open to avoid unnecessary re-renders
      if (isOpen) setIsOpen(false);
    }, 0); // 0ms delay moves the task to the end of the line

    return () => clearTimeout(timer);
  }, [location.pathname]); // Dependency on the path ensures it runs on every navigation

  const isLoggedIn = !!userInfo;

  return (
    <div
      className={`fixed z-60 h-screen bg-black border-r border-neutral-800 
      transition-all duration-300 ease-in-out text-white p-2 gap-3 flex flex-col items-center 
      ${isOpen ? 'w-60 shadow-[10px_0_15px_rgba(0,0,0,0.5)]' : 'w-20'} `}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white px-3 hover:scale-110 transition mb-10"
      >
        <BsLayoutSidebarInset size={26} />
      </button>
      <div className=" flex flex-col gap-4 w-full">
        <SidebarItems
          icon={<FaHome size={28} />}
          label="Home"
          isOpen={isOpen}
          to="/"
        />

        <SidebarItems
          icon={<MdAccountCircle size={28} />}
          label="Your Channel"
          isOpen={isOpen}
          to="/profile"
        />
        <SidebarItems
          icon={<MdOutlineVideoSettings size={28} />}
          label="Manage My Videos"
          isOpen={isOpen}
          to="/myVideos"
        />
        <SidebarItems
          icon={<AiFillLike size={28} />}
          label="liked videos"
          isOpen={isOpen}
          to="/likedVideos"
        />
        <SidebarItems
          icon={<MdHistory size={28} />}
          label="history"
          isOpen={isOpen}
          to="/history"
        />
        <SidebarItems
          icon={<CgPlayListSearch size={28} />}
          label="playlists"
          isOpen={isOpen}
          to="/playlists"
        />
      </div>
      {isLoggedIn && <SubscriptionsList isOpen={isOpen} />}
    </div>
  );
}

function SidebarItems({ icon, label, isOpen, to }) {
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  const handleClick = () => {
    // If it's a private route and no user, send to login
    const privateRoutes = ['/profile', '/myVideos', '/history', '/likedVideos'];
    
    if (privateRoutes.includes(to) && !userInfo) {
      navigate('/auth/login');
    } else {
      navigate(to);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-6 cursor-pointer px-4 py-3 hover:bg-neutral-800 rounded-xl transition-colors w-full group"
    >
      <div className="group-hover:scale-110 transition-transform shrink-0">
        {icon}
      </div>
      {isOpen && <span className="text-sm font-medium truncate">{label}</span>}
    </div>
  );
}
