export default function ProfileHeader({userDetails}){
    // const isCoverImage = userDetails?.coverImage;
    return(
        <div className="bg-black/90 p-4 flex gap-4 items-center text-white">
            {/*cover image ??? */}
            <img src={userDetails?.avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover"/>
            <div className="flex justify-between p-2 flex-1">
                <div>
                <h2 className="text-xl font-semibold">{userDetails.username}</h2>
                <p>Subscribers: {userDetails.totalSubs}</p>
                </div>
                <div>
                    <p>Total videos: </p>
                    <p>Total Tweets: </p>
                    <p>Total views: </p>
                </div>
            </div>
        </div>
    )
}