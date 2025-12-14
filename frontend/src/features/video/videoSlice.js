import { createSlice } from '@reduxjs/toolkit';
import {
  uploadVideo,
  fetchVideoById,
  fetchAllVideos,
  toggleVideoReaction,
  getVideoReactions,
} from './videoAction';

const initialState = {
  videos: [], // All videos (home feed)
  homeLoading: false,
  homeError: null,

  uploadLoading: false,
  uploadSuccess: false,
  uploadError: null,

  singleVideo: null, // One video page (watch page)
  fetchLoading: false,
  fetchError: null,

  //to fetch likes and dislikes for watch page
  reactions: {
    likes: 0,
    dislikes: 0,
    userReaction: 0,
  },
  reactionLoading: false,
  reactionError: null,

  // to like and dislike a video by user
  actionLoading: false,
  actionError: null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    clearUploadError: (state) => {
      state.uploadError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //Upload video
      .addCase(uploadVideo.pending, (state) => {
        state.uploadLoading = true;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadSuccess = true;
        state.videos.push(action.payload);
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.uploadError = action.payload;
        state.uploadLoading = false;
      })
      //fetch video by id
      .addCase(fetchVideoById.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = null;
        state.singleVideo = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
        state.singleVideo = null;
      })
      //fetch all videos
      .addCase(fetchAllVideos.pending, (state) => {
        state.homeLoading = true;
      })
      .addCase(fetchAllVideos.fulfilled, (state, action) => {
        state.homeLoading = false;
        state.homeError = null;
        state.videos = action.payload;
      })
      .addCase(fetchAllVideos.rejected, (state, action) => {
        state.homeLoading = false;
        state.homeError = action.payload;
      })
      // get video reactions
      .addCase(getVideoReactions.pending, (state) => {
        state.reactionLoading = true;
      })
      .addCase(getVideoReactions.fulfilled, (state, action) => {
        state.reactionLoading = false;
        state.reactions = action.payload;
      })
      .addCase(getVideoReactions.rejected, (state, action) => {
        state.reactionLoading = false;
        state.reactionError = action.payload;
      })

      // toggle reaction
      .addCase(toggleVideoReaction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(toggleVideoReaction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.reactions = action.payload; // updated counts
      })
      .addCase(toggleVideoReaction.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export default videoSlice.reducer;
export const { clearUploadError } = videoSlice.actions;
