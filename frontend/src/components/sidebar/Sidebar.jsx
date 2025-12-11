import { useState } from "react";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { FaHome } from "react-icons/fa";
import { MdAccountCircle } from "react-icons/md";
import { Link } from "react-router-dom";

export default function Sidebar(){
    const [isOpen,setIsOpen] = useState(true);
    return (
        <div className={`h-screen bg-gray-900 text-white p-4 flex flex-col items-center  ${isOpen ? "w-60" : "w-20"} `}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white px-3 hover:scale-110 transition mb-10"><BsLayoutSidebarInset size={26} /></button>
            <div className="border-amber-300 border-2 flex flex-col gap-4 flex-1 w-full">
            <SidebarItems icon={<FaHome size={28}/>} label="Home" isOpen={isOpen} to="/"/>
            <SidebarItems icon={<MdAccountCircle size={28}/>} label="Your Channel" isOpen={isOpen} to="/profile"/>
            </div>
        </div>
    )
}

function SidebarItems({icon,label,isOpen,to}){
return(
    <Link to={to} className="flex items-center gap-8 cursor-pointer px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors">
        {icon}
      {isOpen && <span className="text-lg font-normal">{label}</span>}
    </Link>
)
}