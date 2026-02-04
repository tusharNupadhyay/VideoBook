import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useEffect } from 'react';
import {
  fetchVideoById,
  getVideoReactions,
} from '../features/video/videoAction';
import ErrorPage from '../pages/ErrorPage.jsx';
import {
  CommentSection,
  VideoPlayer,
  OwnerSection,
  SuggestedVideos,
  VideoActions,
  VideoDescription,
  VideoPlaylist,
} from '../components/index.js';

export default function Watch() {
  const { videoId } = useParams();
  const dispatch = useAppDispatch();

  const {
    singleVideo: video,
    fetchLoading,
    fetchError,
  } = useAppSelector((state) => state.video);

  useEffect(() => {
    dispatch(fetchVideoById(videoId));
    dispatch(getVideoReactions(videoId));
    // Scroll to top when videoId changes
    window.scrollTo(0, 0);
  }, [videoId, dispatch]);

  if (fetchLoading || !video)
    return <div className="p-10 animate-pulse text-white">Loading...</div>;
  if (fetchError) return <ErrorPage />;

  console.log({ video });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 max-w-[1700px] mx-auto text-white">
      {/* LEFT COLUMN: Main Content (8/12 of the width) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* 1. Video Player */}
        <VideoPlayer src={video.videoFile} />

        {/* 2. Title & Playlist Row */}
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-xl font-bold leading-tight line-clamp-2">
            {video.title}
          </h1>
          <div className="shrink-0">
            <VideoPlaylist videoId={videoId} viewCount={video.viewCount} />
          </div>
        </div>

        {/* 3. Owner & Actions Row  */}
        <div className="flex flex-wrap justify-between items-center gap-4 mt-1">
          <OwnerSection owner={video.owner} />
          <VideoActions videoId={videoId} />
        </div>

        {/* 4. Video Description */}
        <VideoDescription
          date={new Date(video.createdAt).toLocaleDateString('en-GB')}
          description={video.description}
        />

        {/* 5. Comments Section */}
        {video?._id && (
          <CommentSection videoId={video._id} videoOwner={video.owner} />
        )}
      </div>

      {/* RIGHT COLUMN: Suggested Videos (4/12 of the width) */}
      <div className="lg:col-span-4">
        <SuggestedVideos />
      </div>
    </div>
  );
}
