import { useNavigate } from 'react-router-dom';

function VideoCard({ video }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/watch/${video._id}`)}
      className="border rounded-lg  overflow-hidden bg-neutral-900 cursor-pointer hover:scale-105 transition text-white min-h-[270px]"
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full aspect-video object-cover "
      />
      <div className="flex p-3 gap-2 items-start ">
        <img
          src={video.owner.avatar}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover mt-1"
        />
        <div className='flex flex-col flex-1  px-2'>
          <p className=" text-xl font-medium">{video.title}</p>
          <p className=" text-gray-400">{video.owner.username}</p>
          <div className='flex gap-4'>
            <p className="text-gray-400">Views: {video.viewCount}</p>
          
          <p className=" text-gray-400">
            Published: {new Date(video.createdAt).toLocaleDateString()}
          </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
