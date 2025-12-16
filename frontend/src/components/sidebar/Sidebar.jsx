import { useState } from 'react';
import { BsLayoutSidebarInset } from 'react-icons/bs';
import { FaHome } from 'react-icons/fa';
import { MdAccountCircle } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { useNavigate } from 'react-router-dom';
import { MdOutlineVideoSettings } from "react-icons/md";


export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`fixed z-10 h-screen bg-black border-r-3 border-gray-900  text-white p-2 flex flex-col items-center  ${isOpen ? 'w-60' : 'w-20'} `}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white px-3 hover:scale-110 transition mb-10"
      >
        <BsLayoutSidebarInset size={26} />
      </button>
      <div className=" flex flex-col gap-4 flex-1 w-full">
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
          <SidebarItems icon={<MdOutlineVideoSettings size={28} />}
          label= "Manage My Videos"
          isOpen={isOpen}
          to="/myVideos"
          />
      </div>
    </div>
  );
}

function SidebarItems({ icon, label, isOpen, to }) {
    const navigate = useNavigate();
    const {initialized,userInfo} = useAppSelector(state=>state.auth);
    const handleClick = () => {
        console.log("authorization: ",{initialized,userInfo});
        if(!initialized)  return <div className="text-blue-700 p-4">Checking session...</div>;
        if(!userInfo && to === "/profile")
        {
            navigate("/auth/login");
            return;
        }
        navigate(to);
    }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-8 cursor-pointer px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
    >
      {icon}
      {isOpen && <span className="text-lg font-normal">{label}</span>}
    </div>
  );
}
