import { createSlice } from '@reduxjs/toolkit';
import {
  uploadVideo,
  fetchVideoById,
  fetchAllVideos,
  toggleVideoReaction,
  getVideoReactions,
  getChannelVideos,
  getMyVideos,
} from './videoAction';

const initialState = {
  // HOME PAGE VIDEOS
  homeVideos: [],
  homeLoading: false,
  homeError: null,

  // UPLOAD STATE
  uploadLoading: false,
  uploadSuccess: false,
  uploadError: null,

  // WATCH PAGE
  singleVideo: null,
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

  // to like and dislike a video on watch page by user
  actionLoading: false,
  actionError: null,

  // VIDEOS ON A USER CHANNEL (PUBLIC)
  channelVideos: [],
  channelLoading: false,
  channelError: null,

  // MANAGE YOUR VIDEOS (PRIVATE)
  myVideos: {
    // always store initial state in what data type api is returning
    videos: [],
    total: 0,
    owner: {},
  },
  myVideosLoading: false,
  myVideosError: null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    resetChannelVideos: (state) => {
      state.channelVideos = [];
      state.channelError = null;
      state.channelLoading = false;
    },
    resetUploadState: (state) => {
      state.uploadLoading = false;
      state.uploadError = null;
      state.uploadSuccess = false;
    },
    resetMyVideos: (state) => {
      state.myVideos = initialState.myVideos;
      state.myVideosError = null;
      state.myVideosLoading = false;
    },
    resetSingleVideo: (state) => {
      state.singleVideo = null;
      state.fetchError = null;
      state.fetchLoading = false;
    },
  },
  //always reset errors on pending
  extraReducers: (builder) => {
    builder
      //Upload video
      .addCase(uploadVideo.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadVideo.fulfilled, (state) => {
        state.uploadLoading = false;
        state.uploadSuccess = true;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.uploadError = action.payload;
        state.uploadLoading = false;
      })
      //fetch video by id
      .addCase(fetchVideoById.pending, (state) => {
        state.fetchLoading = true;
        state.singleVideo = null; //clear only singleVideo state on pending not other states because you are navigating to other video so old video should not show while pending
        state.fetchError = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = null;
        state.singleVideo = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
        state.singleVideo = null; //do not set singleVideo to action.payload in rejected case as it is not an array and will behave badly when you watch another video
      })
      //fetch all videos for homepage
      .addCase(fetchAllVideos.pending, (state) => {
        state.homeLoading = true;
        state.homeError = null;
      })
      .addCase(fetchAllVideos.fulfilled, (state, action) => {
        state.homeLoading = false;
        state.homeError = null;
        state.homeVideos = action.payload;
      })
      .addCase(fetchAllVideos.rejected, (state, action) => {
        state.homeLoading = false;
        state.homeError = action.payload;
      })
      // get video reactions
      .addCase(getVideoReactions.pending, (state) => {
        state.reactionLoading = true;
        state.reactionError = null;
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
        state.actionError = null;
      })
      .addCase(toggleVideoReaction.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.reactions = action.payload; // updated counts
      })
      .addCase(toggleVideoReaction.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      //get channel videos by username (public)
      .addCase(getChannelVideos.pending, (state) => {
        state.channelLoading = true;
        state.channelError = null;
      })
      .addCase(getChannelVideos.fulfilled, (state, action) => {
        state.channelLoading = false;
        state.channelVideos = action.payload;
        state.channelError = null;
      })
      .addCase(getChannelVideos.rejected, (state, action) => {
        state.channelLoading = false;
        state.channelError = action.payload;
      })
      //get my videos (PRIVATE)
      .addCase(getMyVideos.pending, (state) => {
        state.myVideosLoading = true;
        state.myVideosError = null;
      })
      .addCase(getMyVideos.fulfilled, (state, action) => {
        state.myVideosLoading = false;
        state.myVideos = action.payload;
        state.myVideosError = null;
      })
      .addCase(getMyVideos.rejected, (state, action) => {
        state.myVideosLoading = false;
        state.myVideosError = action.payload;
      });
  },
});

export default videoSlice.reducer;
export const {
  clearUploadError,
  resetChannelVideos,
  resetUploadState,
  resetMyVideos,
  resetSingleVideo,
} = videoSlice.actions;
