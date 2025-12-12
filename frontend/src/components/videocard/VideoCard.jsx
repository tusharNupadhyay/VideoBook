
function VideoCard({video}) {
    return(
        <div className="border-2">
            <img src={video.thumbnail} alt={video.title} />
            <div>
                <h3>{video.title}</h3>
                   <p> {video.views}</p>
                   <p>{video.owner.username}</p> 
                
            </div>
        </div>
    )
}

export default VideoCard;