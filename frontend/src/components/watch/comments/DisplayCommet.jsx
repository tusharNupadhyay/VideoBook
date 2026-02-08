import { memo, useState,useEffect,useRef } from 'react';
import {
  deleteComment,
  toggleCommentReaction,
  editComment,
} from "../../../features/comments/commentAction.js";
import { useAppDispatch, useAppSelector } from '../../../app/hooks.js';
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from 'react-icons/bi';
import { SlOptionsVertical } from "react-icons/sl";
import timeAgo from '../../../utility/timeAgo.js';

function DisplayComment({ comment,videoOwner }) {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const loadingById = useAppSelector(
    (state) => state.comment.commentActionLoadingById
  );

  //to detect outside click
  const menuRef = useRef(null);

  const isCommentOwner =comment?.owner?._id === userInfo?._id;
  const isAuthor = comment?.owner?._id === videoOwner?._id;
  const isLoading = loadingById?.[comment._id];
    
  const isLoggedIn = !!userInfo; //boolean
  const reactions = comment.reactions || {};
  // const disableReactions = !isLoggedIn || isLoading;
  

  //edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.content);
  const [commentOptions,setCommentOptions] = useState(false); //delete and edit comment options

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setCommentOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


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
      setCommentOptions(false);
    } catch (error) {
      // console.error('Failed to edit comment: ', error);
    }
  };
  

  return (
    <div className="group flex px-2 py-3 gap-4 hover:bg-white/5 transition rounded-xl relative">
      <img src={comment.owner?.avatar} className="h-10 w-10 rounded-full shrink-0 object-cover" alt="pfp" />
      
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-white">@{comment.owner?.username}</span>
          {isAuthor && <span className="text-[10px] bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded-full uppercase tracking-tighter">Author</span>}
          <span className="text-[10px] text-neutral-500">{timeAgo(comment.createdAt)}</span>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none w-full"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="text-xs font-bold px-3 py-1.5 hover:bg-white/10 rounded-full">Cancel</button>
              <button onClick={handleEditSave} className="text-xs font-bold bg-blue-600 px-4 py-1.5 rounded-full">Save</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-200 leading-relaxed wrap-break-word">{comment.content}</p>
        )}

        <div className="flex items-center gap-4 mt-2">
          <button 
            disabled={!isLoggedIn || isLoading}
            onClick={() => dispatch(toggleCommentReaction({ commentId: comment._id, value: 1 }))}
            className="flex items-center gap-1.5 hover:bg-white/10 p-1.5 rounded-full transition group"
          >
            {reactions.userReaction === 1 ? <BiSolidLike className="text-blue-500" /> : <BiLike />}
            <span className="text-xs text-neutral-400">{reactions.likes || 0}</span>
          </button>
          
          <button 
            disabled={!isLoggedIn || isLoading}
            onClick={() => dispatch(toggleCommentReaction({ commentId: comment._id, value: -1 }))}
            className="flex items-center gap-1.5 hover:bg-white/10 p-1.5 rounded-full transition"
          >
            {reactions.userReaction === -1 ? <BiSolidDislike className="text-red-500" /> : <BiDislike />}
          </button>
        </div>
      </div>

      {isCommentOwner && !isEditing && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition" ref={menuRef}>
          <button onClick={() => setCommentOptions(!commentOptions)} className="p-2 hover:bg-neutral-800 rounded-full">
            <SlOptionsVertical size={12} />
          </button>
          {commentOptions && (
            <div className="absolute right-0 top-8 w-32 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl z-50 py-1">
              <button onClick={() => { setIsEditing(true); setCommentOptions(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-700">Edit</button>
              <button onClick={() => dispatch(deleteComment(comment._id))} className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-neutral-700">Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DisplayComment);