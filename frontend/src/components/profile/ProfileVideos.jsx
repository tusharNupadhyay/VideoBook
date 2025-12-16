import VideoCard from "../videocard/VideoCard";

export default function ProfileVideos({videos}){
    
    if(!videos) return (<div>Loading Videos...</div>)

    return(
        <div className="bg-black/90 p-4 flex flex-col flex-1 text-white">
            <h2 className="text-lg font-semibold mb-3 text-white mx-auto">PROFILE videos</h2>
            {videos?.length===0 ? (<p>No videos uploaded yet.</p>) : (
                <div className="grid grid-cols-3 gap-4">
                    {videos?.map(v=>(<VideoCard key={v._id} video={v}/>))}
                </div>
            )}
        </div>
    )
}