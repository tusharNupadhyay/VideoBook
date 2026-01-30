import { createSlice } from '@reduxjs/toolkit';
import {
  uploadVideo,
  fetchVideoById,
  fetchAllVideos,
  toggleVideoReaction,
  getVideoReactions,
  getChannelVideos,
  getMyVideos,
  updateVideoDetails,
  getLikedVideos,
  getWatchHistory,
  deleteVideo
} from './videoAction';

const initialState = {
  // Delete Video states
  deleteVideoLoading: false,
  deleteVideoError: null,

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
    userReaction: null,
  },
  reactionLoading: false,
  reactionError: null,

  // to like and dislike a video on watch page by user
  actionLoading: false,
  actionError: null,

  // USER WATCH HISTORY
  watchHistory: {
    videos: [],
    loading: false,
    error: null,
  },

  // USER LIKED VIDEOS
  likedVideos: {
    videos: [],
    total: 0,
    loading: false,
    error: null,
  },

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
    resetWatchHistory: (state) => {
      state.watchHistory = initialState.watchHistory;
    },
    resetLikedVides: (state) => {
      state.likedVideos = initialState.likedVideos;
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
      })
      //update video details
      .addCase(updateVideoDetails.pending, (state) => {
        state.fetchLoading = true;
        state.singleVideo = null;
        state.fetchError = null;
      })
      .addCase(updateVideoDetails.fulfilled, (state, action) => {
        state.fetchLoading = false;
        const updatedVideo = action.payload;
        state.myVideos.videos = state.myVideos.videos.map((video) =>
          video._id === updatedVideo._id ? updatedVideo : video
        );
        //Method 2 RTK also allows direct mutation via immer, so can also do this
        //const index = state.myVideos.videos.findIndex(video=> video._id===updatedVideo._id);
        //if(index!==-1) state.myVideos.videos[index] = updatedVideo;
      })
      .addCase(updateVideoDetails.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
      })
      // WATCH HISTORY
      .addCase(getWatchHistory.pending, (state) => {
        state.watchHistory.loading = true;
        state.watchHistory.error = null;
      })
      .addCase(getWatchHistory.fulfilled,(state,action) => {
        state.watchHistory.loading = false;
        state.watchHistory.videos = action.payload.history;
      })
      .addCase(getWatchHistory.rejected,(state,action)=> {
        state.watchHistory.error = action.payload;
        state.watchHistory.loading = false;
      })
      //Liked Videos
      .addCase(getLikedVideos.pending, (state) => {
        state.likedVideos.loading = true;
        state.likedVideos.error = null;
      })
      .addCase(getLikedVideos.fulfilled,(state,action) => {
        state.likedVideos.loading = false;
        state.likedVideos.videos = action.payload;
      })
      .addCase(getLikedVideos.rejected,(state,action)=> {
        state.likedVideos.error = action.payload;
        state.likedVideos.loading = false;
      })
      //Delete video
      .addCase(deleteVideo.pending,(state) => {
        state.deleteVideoLoading = true;
        state.deleteVideoError = null;
      })
      .addCase(deleteVideo.fulfilled,(state,action)=>{
        state.deleteVideoLoading =false;
        state.myVideos.videos = state.myVideos.videos.filter(video => video._id !== action.payload);
      })
      .addCase(deleteVideo.rejected,(state,action)=>{
        state.deleteVideoLoading = false;
        state.deleteVideoError = action.payload || "cannot delete video";
      })
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
