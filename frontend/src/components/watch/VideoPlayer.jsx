
function VideoPlayer({src}){
    
return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl">
        <video src={src} controls  className="w-full h-full object-contain" />
    </div>
)
}

export {VideoPlayer}