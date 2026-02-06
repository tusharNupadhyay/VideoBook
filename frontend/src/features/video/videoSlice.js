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
  deleteVideo,
  clearWatchHistory,
} from './videoAction';
import { logoutUser } from '../auth/authActions';
import { toggleSubscription } from '../user/userActions';

const initialState = {
  // Delete Video states
  deleteVideoLoading: false,
  deleteVideoError: null,

  // HOME PAGE VIDEOS
  homeVideos: [],
  homePage: 1,
  hasNextHomePage: false,
  homeLoading: false,
  homeError: null,

  //suggested videos in watch page
  suggestedVideos: [],
  suggestedPage: 1,
  hasMoreSuggestions: true,

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
    page: 1,
    hasNextPage: false,
    total: 0,
    loading: false,
    error: null,
  },

  // USER LIKED VIDEOS
  likedVideos: {
    videos: [],
    page: 1,
    hasNextPage: false,
    total: 0,
    loading: false,
    error: null,
  },

  // VIDEOS ON A USER CHANNEL (PUBLIC)
  channelVideos: {
    videos: [],
    page: 1,
    hasNextPage: false,
    total: 0,
    loading: false,
    error: null,
  },
  // channelVideos: [],
  // channelPage: 1,
  // hasNextChannelPage: false,
  // channelLoading: false,
  // channelError: null,

  // MANAGE YOUR VIDEOS (PRIVATE)
  myVideos: {
    videos: [],
    total: 0,
    page: 1,
    hasNextPage: false,
    owner: {},
  },
  myVideosLoading: false,
  myVideosError: null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    // Logic to shuffle and pick the first batch
    initializeSuggestions: (state, action) => {
      const currentVideoId = action.payload;
      // Filter out the current video
      const filtered = state.homeVideos.filter((v) => v._id !== currentVideoId);
      // Shuffle the array
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());

      state.suggestedVideos = shuffled.slice(0, 10); // First 10
      state.suggestedPage = 1;
      state.hasMoreSuggestions = shuffled.length > 10;
    },
    // Logic to load the next 10
    loadMoreSuggestions: (state, action) => {
      const currentVideoId = action.payload;
      const filtered = state.homeVideos.filter((v) => v._id !== currentVideoId);

      const start = state.suggestedPage * 10;
      const end = start + 10;
      const nextBatch = filtered.slice(start, end);

      if (nextBatch.length > 0) {
        state.suggestedVideos = [...state.suggestedVideos, ...nextBatch];
        state.suggestedPage += 1;
      }

      state.hasMoreSuggestions = filtered.length > end;
    },
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    resetChannelVideos: (state) => {
      state.channelVideos = initialState.channelVideos;
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
      //reset when logout
      .addCase(logoutUser.fulfilled, () => initialState)
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
        const watchedVideo = action.payload;
        if (!watchedVideo) return;

        // --- SYNC WATCH HISTORY ---
        // 1. Check if the video already exists in the local history array
        const alreadyExists = state.watchHistory.videos.find(
          (v) => v._id === watchedVideo._id
        );

        // 2. Filter out the video if it exists so we can move it to the top
        const filteredHistory = state.watchHistory.videos.filter(
          (v) => v._id !== watchedVideo._id
        );

        // 3. Update the array (Put the newest at index 0)
        state.watchHistory.videos = [watchedVideo, ...filteredHistory];

        // 4. FIX THE TOTAL COUNT LOGIC
        // Only increment if the video was NOT already in our local list
        if (!alreadyExists) {
          // Safety check: if total is somehow corrupted or 0 after a clear,
          // ensure we don't jump ahead.
          state.watchHistory.total =
            state.watchHistory.videos.length > state.watchHistory.total
              ? state.watchHistory.videos.length
              : state.watchHistory.total + 1;
        }
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
        const { videos, hasNextPage, currentPage } = action.payload;
        if (currentPage === 1) {
          state.homeVideos = videos;
        } else {
          state.homeVideos = [...state.homeVideos, ...videos];
        }

        state.hasNextHomePage = hasNextPage;
        state.homePage = currentPage;
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
        const videoId = action.meta.arg.videoId; // Passed from thunk
        const { userReaction } = action.payload; //1,-1 or null
        //  Sync with Liked Videos list
        if (userReaction === 1) {
          // VIDEO WAS JUST LIKED
          if (state.singleVideo && state.singleVideo._id === videoId) {
            // Check if it's already there to avoid duplicates
            const isAlreadyInList = state.likedVideos.videos.some(
              (v) => v._id === videoId
            );

            if (!isAlreadyInList) {
              // Add to the top of the list
              state.likedVideos.videos.unshift(state.singleVideo);
              state.likedVideos.total += 1;
            }
          }
        } else {
          // VIDEO WAS UNLIKED OR DISLIKED
          // If it was in the liked list, remove it
          const wasInList = state.likedVideos.videos.some(
            (v) => v._id === videoId
          );

          if (wasInList) {
            state.likedVideos.videos = state.likedVideos.videos.filter(
              (v) => v._id !== videoId
            );
            state.likedVideos.total -= 1;
          }
        }
      })
      .addCase(toggleVideoReaction.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      //get channel videos by username (public)
      .addCase(getChannelVideos.pending, (state) => {
        state.channelVideos.loading = true;
        state.channelVideos.error = null;
      })
      .addCase(getChannelVideos.fulfilled, (state, action) => {
        state.channelVideos.loading = false;
        const { videos, hasNextPage, currentPage, totalVideos } =
          action.payload;
        if (currentPage === 1) {
          state.channelVideos.videos = videos;
        } else {
          state.channelVideos.videos = [
            ...state.channelVideos.videos,
            ...videos,
          ];
        }

        state.channelVideos.hasNextPage = hasNextPage;
        state.channelVideos.page = currentPage;
        state.channelVideos.total = totalVideos;
      })
      .addCase(getChannelVideos.rejected, (state, action) => {
        state.channelVideos.loading = false;
        state.channelVideos.error = action.payload;
      })
      //get my videos (PRIVATE)
      .addCase(getMyVideos.pending, (state) => {
        state.myVideosLoading = true;
        state.myVideosError = null;
      })
      .addCase(getMyVideos.fulfilled, (state, action) => {
        state.myVideosLoading = false;

        const { videos, owner, pagination } = action.payload;
        if (pagination.page === 1) {
          state.myVideos.videos = videos;
        } else {
          // Append for infinite scroll or "Load More"
          state.myVideos.videos = [...state.myVideos.videos, ...videos];
        }
        state.myVideos.owner = owner;
        state.myVideos.total = pagination.total;
        state.myVideos.page = pagination.page;
        state.myVideos.hasNextPage = pagination.hasNextPage;
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
      .addCase(getWatchHistory.fulfilled, (state, action) => {
        state.watchHistory.loading = false;
        const { history, pagination } = action.payload;
        if (pagination.page === 1) {
          state.watchHistory.videos = history;
        } else {
          state.watchHistory.videos = [
            ...state.watchHistory.videos,
            ...history,
          ];
        }
        state.watchHistory.page = pagination.page;
        state.watchHistory.hasNextPage = pagination.hasNextPage;
        state.watchHistory.total = pagination.total;
      })
      .addCase(getWatchHistory.rejected, (state, action) => {
        state.watchHistory.error = action.payload;
        state.watchHistory.loading = false;
      })
      //clear watch history
      .addCase(clearWatchHistory.pending, (state) => {
        state.watchHistory.loading = true;
        state.watchHistory.error = null;
      })
      .addCase(clearWatchHistory.fulfilled, (state) => {
        state.watchHistory.videos = [];
        state.watchHistory.total = 0;
        state.watchHistory.hasNextPage = false;
        state.watchHistory.page = 1;
      })
      .addCase(clearWatchHistory.rejected, (state, action) => {
        state.watchHistory.loading = false;
        state.watchHistory.error = action.payload;
      })
      //Liked Videos
      .addCase(getLikedVideos.pending, (state) => {
        state.likedVideos.loading = true;
        state.likedVideos.error = null;
      })
      .addCase(getLikedVideos.fulfilled, (state, action) => {
        state.likedVideos.loading = false;
        const { videos, pagination } = action.payload;

        if (pagination.page === 1) {
          state.likedVideos.videos = videos;
        } else {
          // Append logic for Infinite Scroll
          state.likedVideos.videos = [...state.likedVideos.videos, ...videos];
        }

        state.likedVideos.page = pagination.page;
        state.likedVideos.hasNextPage = pagination.hasNextPage;
        state.likedVideos.total = pagination.total;
      })
      .addCase(getLikedVideos.rejected, (state, action) => {
        state.likedVideos.error = action.payload;
        state.likedVideos.loading = false;
      })
      //Delete video
      .addCase(deleteVideo.pending, (state) => {
        state.deleteVideoLoading = true;
        state.deleteVideoError = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.deleteVideoLoading = false;
        state.myVideos.videos = state.myVideos.videos.filter(
          (video) => video._id !== action.payload
        );
        state.myVideos.total -= 1;
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.deleteVideoLoading = false;
        state.deleteVideoError = action.payload || 'cannot delete video';
      })
      //update subscription after user has subscribed
      .addCase(toggleSubscription.fulfilled, (state, action) => {
        if (state.singleVideo && state.singleVideo.owner) {
          const isSubscribed = action.payload.subscribed;
          state.singleVideo.owner.isSubscribed = isSubscribed;
          if (isSubscribed) state.singleVideo.owner.subscribersCount += 1;
          else state.singleVideo.owner.subscribersCount -= 1;
        }
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
  initializeSuggestions,
  loadMoreSuggestions,
} = videoSlice.actions;
