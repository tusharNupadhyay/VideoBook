import { useState } from "react";


export function VideoDescription({date,description}){
const [isExpanded, setIsExpanded] = useState(false);
    return(
        <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-neutral-800 hover:bg-neutral-700 transition cursor-pointer p-4 rounded-xl flex flex-col gap-1"
    >
      <div className="flex gap-3 text-sm font-bold mb-1">
        <span>{date}</span>
        <span className="text-neutral-400">#videos #trending</span>
      </div>
      <p className={`text-sm leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {description}
      </p>
      <button className="text-xs font-bold mt-1 text-white/70">
        {isExpanded ? "Show less" : "...more"}
      </button>
    </div>
    )
}