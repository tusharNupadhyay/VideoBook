import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks.js';
import { useState } from 'react';
import {
  addComment,
  fetchCommentsByVideo,
} from '../../../features/comments/commentAction';
import DisplayComment from './DisplayCommet.jsx';
import { clearComments } from '../../../features/comments/commentSlice.js';

export function CommentSection({ videoId, videoOwner }) {

  const [commentText, setCommentText] = useState('');
  const sentinelRef = useRef(null);

  const { userInfo } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!userInfo;
  const isDisabled = commentText.trim().length === 0 || !isLoggedIn;

  const dispatch = useAppDispatch();
  const {
    comments,
    commentsLoading,
    addCommentLoading,
    hasNextPage,
    page,
    totalComments,
  } = useAppSelector((state) => state.comment);

  // Initial load
  useEffect(() => {
    
    // Only dispatch if videoId exists and is NOT the string "undefined"
    if (!videoId || videoId === "undefined") return;

    dispatch(fetchCommentsByVideo({ videoId, page: 1 }));

    // CLEANUP: Reset comments when moving to a different video
    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, videoId]);

  // 2. Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !commentsLoading &&
          videoId &&
          videoId !=="undefined"
        ) {
          dispatch(fetchCommentsByVideo({ videoId, page: page + 1 }));
        }
      },
      { threshold: 1.0 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [dispatch, videoId, hasNextPage, page, commentsLoading]);

  const handleAddComment = () => {
    if (!commentText.trim()) return; // ignore empty comments
    dispatch(addComment({ videoId, commentText }));
    setCommentText('');
  };

  if (commentsLoading) return <div>Loading Comments...</div>;

  return (
    <div className="bg-neutral-900/50 rounded-xl p-4 flex flex-col gap-6">
      <h3 className="text-lg font-bold">{totalComments} Comments</h3>

      {/* Input Section */}
      <div className="flex gap-4 items-start">
        <img
          src={userInfo?.avatar || '/default-avatar.png'}
          className="h-10 w-10 rounded-full"
          alt="me"
        />
        <div className="flex flex-col flex-1 gap-2">
          <input
            type="text"
            disabled={!isLoggedIn}
            value={commentText}
            placeholder={isLoggedIn ? 'Add a comment...' : 'Sign in to comment'}
            className="bg-transparent border-b border-neutral-700 py-2 focus:outline-none focus:border-white transition-colors text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            onChange={(e) => setCommentText(e.target.value)}
          />
          {commentText.trim() && (
            <div className="flex justify-end gap-3 mt-1">
              <button
                onClick={() => setCommentText('')}
                className="text-sm font-semibold hover:bg-white/10 px-4 py-2 rounded-full"
              >
                Cancel
              </button>
              <button
                disabled={isDisabled || addCommentLoading}
                onClick={handleAddComment}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 px-4 py-2 rounded-full text-sm font-semibold"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-1">
        {comments.map((comment) => (
          <DisplayComment
            key={comment._id}
            comment={comment}
            videoOwner={videoOwner}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-10 flex justify-center items-center">
        {commentsLoading && (
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
