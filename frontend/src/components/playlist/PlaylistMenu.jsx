import { memo, useEffect, useRef, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";

function PlaylistMenu({onEdit,onDelete}){
    const [open,setOpen] = useState(false);

    const menuRef = useRef(null);
    // close this modal on outside click
    useEffect(()=>{
        const handleClick = (e) => {
            if(menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown",handleClick);

        return () => document.removeEventListener("mousedown",handleClick);
    },[]);
    return(
        <div className="relative" ref={menuRef}>
            {/*Edit button for playlist */}
            <button onClick={()=> setOpen(prev => !prev)} className="p-2 rounded-full hover:bg-white/10 transition" aria-label="playlist options">
                <CiMenuKebab />
            </button>
            {/*Dropdown menu */}
            {open && (
                <div className="absolute right-0 mt-2 text-sm text-gray-300 bg-neutral-800 rounded-lg">
                    <button onClick={()=> {
                        setOpen(false);
                        onEdit();
                    }
                    } className="w-full px-4 py-2 border-b-gray-600 border-b hover:cursor-pointer">
                        Edit 
                    </button>
                    <button onClick={()=>{setOpen(false); onDelete();}} className="w-full px-4 py-2 hover:cursor-pointer">
                        Delete 
                    </button>
                </div>
            )}
        </div>
    )
}

export default memo(PlaylistMenu);