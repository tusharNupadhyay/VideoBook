import { useState } from 'react';
import {
  addComment,
  fetchCommentsByVideo,
  deleteComment,
  toggleCommentReaction,
  editComment,
} from '../../features/comments/commentAction';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MdDelete } from 'react-icons/md';
import { IoIosThumbsUp } from 'react-icons/io';
import { IoIosThumbsDown } from 'react-icons/io';
import { CiEdit } from "react-icons/ci";
import { SlOptionsVertical } from "react-icons/sl";

export default function CommentSection({ videoId }) {
  const [commentText, setCommentText] = useState('');
  const isDisabled = commentText.trim().length === 0;
  const dispatch = useAppDispatch();
  const { comments, commentsLoading, addCommentLoading, commentsError } =
    useAppSelector((state) => state.comment);

  const handleAddComment = () => {
    if (!commentText.trim()) return; // ignore empty comments
    dispatch(addComment({ videoId, commentText }));
    setCommentText('');
  };
  useEffect(() => {
    dispatch(fetchCommentsByVideo(videoId));
  }, [dispatch, videoId]);

  if (commentsLoading) return <div>Loading Comments...</div>;
  if (commentsError)
    return <div className="text-red-500">Cannot fetch Comments.</div>;
  return (
    <div className="bg-black flex-1 rounded-lg p-2 flex flex-col gap-2 ">
      {/*Comments */}
      <h3>Total comments</h3>
      <div className="flex gap-1 items-center">
        <input
          type="text"
          value={commentText}
          placeholder="add a comment..."
          className="border p-2 flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !addCommentLoading) {
              handleAddComment();
            }
          }}
          onChange={(e) => {
            setCommentText(e.target.value);
          }}
        />
        <button
          disabled={isDisabled || addCommentLoading}
          onClick={handleAddComment}
          className={`px-3 py-2 text-white rounded ${!isDisabled ? 'hover:bg-blue-700 bg-blue-600 cursor-pointer' : 'pointer-events-none bg-blue-400'}`}
        >
          Add
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {/* Comments by other users */}
        {comments?.length !== 0 ? (
          <div>
            {comments.map((comment) => (
              <DisplayComment key={comment._id} comment={comment} />
            ))}
          </div>
        ) : (
          <h3>there are no comments </h3>
        )}
      </div>
    </div>
  );
}
function DisplayComment({ comment }) {
  const { userInfo } = useAppSelector((state) => state.auth);
  const loadingById = useAppSelector(
    (state) => state.comment.commentActionLoadingById
  );
  const isCommentOwner =
    comment?.owner?._id && userInfo?._id && comment.owner._id === userInfo._id;
  const isLoggedIn = !!userInfo; //boolean
  const disableReactions = !isLoggedIn || loadingById?.[comment._id];
  const isLoading = loadingById?.[comment._id];

  //edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.content);
  const [commentOptions,setCommentOptions] = useState(false); //delete and edit comment options

  const handleEditSave = async () => {
    if (!editedText?.trim()) return;
    try {
      await dispatch(
        editComment({
          commentId: comment._id,
          content: editedText,
        })
      ).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit comment: ', error);
    }
  };
  const handleEditCancel = () => {
    setEditedText(comment.content);
    setIsEditing(false);
  };
  const dispatch = useAppDispatch();
  const handleDeleteComment = async () => {
    try {
      await dispatch(deleteComment(comment._id)).unwrap();
    } catch (error) {
      console.error('cannot delete the comment', error);
    }
  };

  return (
    <div className="flex  px-3 py-2 gap-2">
      <img
        src={comment.owner?.avatar}
        alt="commentProfile"
        className="h-9 w-9 rounded-full"
      />
      <div className="flex flex-col flex-1 gap-1 px-2 py-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-300 font-semibold italic">
            @{comment.owner?.username}
          </p>
          {isCommentOwner && <p className="text-xs font-bold">(author)</p>}
        </div>
         {isCommentOwner && isEditing ? (
            <div className='flex gap-2'>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            disabled={isLoading}
            className="border rounded p-2 w-full text-sm"
            rows={2}
          />
          <div className='flex flex-col gap-2'>
           <button
                onClick={handleEditSave}
                disabled={isLoading}
                className="text-sm px-2 py-1 cursor-pointer hover:bg-slate-900"
              >
                save
              </button>
              <button
                onClick={handleEditCancel}
                disabled={isLoading}
                className="text-sm px-2 py-1  cursor-pointer hover:bg-slate-900"
              >
                cancel
              </button>
              </div>
          </div>
        ) : (
          <p>{comment.content}</p>
        )}

        <div className="flex gap-6 p-2">
          <button
            disabled={disableReactions}
            className={` flex items-center gap-1 ${disableReactions ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 transition cursor-pointer'}`}
            onClick={() =>
              dispatch(
                toggleCommentReaction({ commentId: comment._id, value: 1 })
              )
            }
          >
            <IoIosThumbsUp
              className={` ${comment.reactions?.userReaction == 1 ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            />
            <span className="text-sm">{comment.reactions?.likes ?? 0}</span>
          </button>
          <button
            disabled={disableReactions}
            className={` flex items-center gap-1 ${disableReactions ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 transition cursor-pointer'}`}
            onClick={() =>
              dispatch(
                toggleCommentReaction({ commentId: comment._id, value: -1 })
              )
            }
          >
            <IoIosThumbsDown
              className={` ${comment.reactions.userReaction == -1 ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            />
            <span className="text-sm">{comment.reactions?.dislikes ?? 0}</span>
          </button>
        </div>
      </div>

      
      <button className='relative' onClick={()=>{
        if(isEditing) return;
        setCommentOptions(!commentOptions);
      }}>
        <SlOptionsVertical />
        {commentOptions && isCommentOwner && (
        <div className="absolute text-sm right-4 top-8 bg-black text-white border rounded items-start shadow-lg flex flex-col gap-1 px-2 py-1 ">
             <button
              onClick={() => setIsEditing(true)}
              className="hover:bg-gray-800 w-full cursor-pointer p-1 text-left"
            >
              Edit
            </button>
            <button
            onClick={handleDeleteComment}
            className="hover:bg-gray-800 w-full cursor-pointer p-1 text-left"
          >Delete
          </button>
         
          
        </div>
      )}
      </button>
    </div>
  );
}
