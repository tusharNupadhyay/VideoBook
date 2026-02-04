import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCommentsByVideo,
  addComment,
  deleteComment,
  toggleCommentReaction,
  editComment,
} from './commentAction';
//only for comments under videos not under tweets

const initialState = {
  comments: [], //  if i store this as null then i have to check every time if(comments &&
  commentsLoading: false,
  commentsError: null,

  // Pagination State
  page: 1,
  hasNextPage: false,
  totalComments: 0,

  addCommentLoading: false,
  addCommentError: null,
  deleteCommentLoading: false,
  deleteCommentError: null,

  //actions when user like or dislike a comment
  commentActionLoadingById: {}, // { [commentId]: boolean }
  commentActionError: null,
};

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    clearComments: (state) => {
      return initialState; // Faster way to reset everything
    },
  },
  extraReducers: (builder) => {
    builder
      //fetch all comments of a video and reactions(likes and dislikes)
      .addCase(fetchCommentsByVideo.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(fetchCommentsByVideo.fulfilled, (state, action) => {
        const { comments, hasNextPage, page, totalComments } = action.payload;

        // If it's page 1, start fresh. Otherwise, add new comments to the list.
        if (page === 1) {
          state.comments = comments;
        } else {
          state.comments = [...state.comments, ...comments];
        }

        state.page = page;
        state.hasNextPage = hasNextPage;
        state.totalComments = totalComments;
        state.commentsLoading = false;
    
      })
      .addCase(fetchCommentsByVideo.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      //add a comment to a video
      .addCase(addComment.pending, (state) => {
        state.addCommentLoading = true;
        state.addCommentError = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.addCommentLoading = false;
        state.comments.unshift({
            ...action.payload,
            reactions: {
                likes: 0,
                dislikes: 0,
                userReaction: null,
            }
        });
      })
      .addCase(addComment.rejected, (state, action) => {
        state.addCommentLoading = false;
        state.addCommentError = action.payload;
      })
      //delete comment
      .addCase(deleteComment.pending, (state) => {
        state.deleteCommentLoading = true;
        state.deleteCommentError = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.deleteCommentLoading = false;
        state.comments = state.comments.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.deleteCommentLoading = false;
        state.deleteCommentError = action.payload || action.error.message;
      })
      //toggle comment reaction (like or dislike a comment)
      .addCase(toggleCommentReaction.pending, (state, action) => {
        const { commentId } = action.meta.arg; //action.meta.arg comes from thunk's input arguments
        state.commentActionLoadingById[commentId] = true;
        state.commentActionError = null;
      })
      .addCase(toggleCommentReaction.fulfilled, (state, action) => {
        const { commentId } = action.meta.arg;
        const { likes, dislikes, userReaction } = action.payload;

        const comment = state.comments.find((c) => c._id === commentId);
        if (comment) {
          comment.reactions = { likes, dislikes, userReaction }; //using immer you can directly mutate the state
        }
        state.commentActionLoadingById[commentId] = false;
      })
      .addCase(toggleCommentReaction.rejected, (state, action) => {
        const { commentId } = action.meta.arg;
        state.commentActionLoadingById[commentId] = false;
        state.commentActionError = action.payload;
      })
      //edit comment
      .addCase(editComment.pending, (state, action) => {
        const { commentId } = action.meta.arg;
        state.commentActionLoadingById[commentId] = true;
        state.commentActionError = null;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const { content } = action.payload;
        const {commentId} = action.meta.arg;

        const comment = state.comments.find((c) => c._id === commentId);
        if (comment) {
          comment.content = content;
        }

        state.commentActionLoadingById[commentId] = false;
      })
      .addCase(editComment.rejected, (state, action) => {
        const { commentId } = action.meta.arg;
        state.commentActionLoadingById[commentId] = false;
        state.commentActionError = action.payload;
      });
  },
});

export default commentSlice.reducer;
export const { clearComments } = commentSlice.actions;
