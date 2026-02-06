import { createSlice } from '@reduxjs/toolkit';
import { logoutUser } from '../auth/authActions';
import {
  getChannelPlaylists,
  getMyPlaylists,
  getPlaylistById,
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
  togglePrivacy,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from './playlistAction';

const initialState = {
  playlists: [], // logged-in user's playlists
  channelPlaylists: [], // viewed channel playlists

  currentPlaylist: {
    metadata: null,
    videos: [],
  },
  loading: {
    fetch: false,
    mutate: false, // create, update, add/remove video, toggle
  },
  error: {
    fetch: null,
    mutate: null,
  },
  // Standardized Pagination
  pagination: {
    myPlaylists: { page: 1, hasNextPage: false, total: 0 },
    channelPlaylists: { page: 1, hasNextPage: false, total: 0 },
    currentPlaylist: { page: 1, hasNextPage: false, total: 0 },
  },
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    resetCurrentPlaylist: (state) => {
      state.currentPlaylist = initialState.currentPlaylist;
      state.pagination.currentPlaylist =
        initialState.pagination.currentPlaylist;
    },
    resetchannelPlaylist: (state) => {
      state.channelPlaylists = [];
      state.pagination.channelPlaylists =
        initialState.pagination.channelPlaylists;
    },
  },
  extraReducers: (builder) => {
    builder
      //logout
      .addCase(logoutUser.fulfilled, () => initialState)
      //create playlist
      .addCase(createPlaylist.pending, (state) => {
        state.loading.mutate = true;
        state.error.mutate = null;
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.loading.mutate = false;
        state.playlists.unshift(action.payload);
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.loading.mutate = false;
        state.error.mutate = action.payload || 'failed to create playlist';
      })
      //get channel playlists
      .addCase(getChannelPlaylists.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
        // state.pagination.channelPlaylists.page = 1;
      })
      .addCase(getChannelPlaylists.fulfilled, (state, action) => {
        state.loading.fetch = false;
        const { playlists, totalPlaylists, currentPage, hasNextPage } =
          action.payload;
        state.channelPlaylists =
          currentPage === 1
            ? playlists
            : [...state.channelPlaylists, ...playlists];
        state.pagination.channelPlaylists = {
          page: currentPage,
          hasNextPage,
          total: totalPlaylists,
        };
      })
      .addCase(getChannelPlaylists.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch =
          action.payload || "failed to fetch channel's playlist";
      })
      //get my playlists
      .addCase(getMyPlaylists.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
        // state.pagination.myPlaylists.page = 1;
      })
      .addCase(getMyPlaylists.fulfilled, (state, action) => {
        state.loading.fetch = false;
        const { playlists, totalPlaylists, currentPage, hasNextPage } =
          action.payload;
        // If page is 1, we MUST replace the whole list to ensure
        // we have the freshest 'hasVideo' statuses from the server.
        if (currentPage === 1) {
          state.playlists = playlists;
        } else {
          // Only append for subsequent pages
          state.playlists = [...state.playlists, ...playlists];
        }

        state.pagination.myPlaylists = {
          page: currentPage,
          hasNextPage,
          total: totalPlaylists,
        };
      })
      .addCase(getMyPlaylists.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload || 'failed to fetch my playlists';
      })
      //fetch playlist by id
      .addCase(getPlaylistById.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(getPlaylistById.fulfilled, (state, action) => {
        state.loading.fetch = false;
        const { playlist, videos, currentPage, hasNextPage, totalVideos } =
          action.payload;

        if (currentPage === 1) {
          state.currentPlaylist.metadata = playlist;
          state.currentPlaylist.videos = videos;
        } else {
          state.currentPlaylist.videos = [
            ...state.currentPlaylist.videos,
            ...videos,
          ];
        }

        state.pagination.currentPlaylist = {
          page: currentPage,
          hasNextPage,
          total: totalVideos,
        };
      })
      .addCase(getPlaylistById.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload || 'failed to fetch the playlist';
      })
      //add video to playlist
      .addCase(addVideoToPlaylist.pending, (state) => {
        state.loading.mutate = true;
        state.error.mutate = null;
      })
      .addCase(addVideoToPlaylist.fulfilled, (state, action) => {
        state.loading.mutate = false;
        const { playlist, totalVideos } = action.payload; // Data from backend

        // Update the "playlists" array (for Modals/Checkboxes)
        const pIndex = state.playlists.findIndex((p) => p._id === playlist._id);
        if (pIndex !== -1) {
          state.playlists[pIndex] = {
            ...state.playlists[pIndex],
            hasVideo: true,
            totalVideos,
            coverImage: playlist.coverImage, // Update cover too!
          };
        }

        //  Update the "channelPlaylists" array (for the Library/Card page)
        const cIndex = state.channelPlaylists.findIndex(
          (p) => p._id === playlist._id
        );
        if (cIndex !== -1) {
          state.channelPlaylists[cIndex] = {
            ...state.channelPlaylists[cIndex],
            totalVideos,
            coverImage: playlist.coverImage,
          };
        }
        //  Update Metadata & Total Count for the Details Page
        if (state.currentPlaylist.metadata?._id === playlist._id) {
          // Update cover image (in case we deleted the cover video)
          state.currentPlaylist.metadata.coverImage = playlist.coverImage;

          // Update the pagination total
          state.pagination.currentPlaylist.total = totalVideos;

          // // Filter out the video object from the list locally
          // state.currentPlaylist.videos = state.currentPlaylist.videos.filter(
          //   (v) => v._id !== videoId
          // );
        }
      })
      .addCase(addVideoToPlaylist.rejected, (state, action) => {
        state.loading.mutate = false;
        state.error.mutate =
          action.payload || 'failed to add video my playlists';
      })
      //remove video from playlist
      .addCase(removeVideoFromPlaylist.pending, (state) => {
        state.loading.mutate = true;
        state.error.mutate = null;
      })
      .addCase(removeVideoFromPlaylist.fulfilled, (state, action) => {
        state.loading.mutate = false;
        const { playlist, totalVideos } = action.payload;
        const { videoId } = action.meta.arg;

        // Update the "playlists" array (Modal/Checkboxes)
        const pIndex = state.playlists.findIndex((p) => p._id === playlist._id);
        if (pIndex !== -1) {
          state.playlists[pIndex] = {
            ...state.playlists[pIndex],
            hasVideo: false,
            totalVideos,
            coverImage: playlist.coverImage,
          };
        }

        //  Update the "channelPlaylists" array (Library Cards)
        const cIndex = state.channelPlaylists.findIndex(
          (p) => p._id === playlist._id
        );
        if (cIndex !== -1) {
          state.channelPlaylists[cIndex] = {
            ...state.channelPlaylists[cIndex],
            totalVideos,
            coverImage: playlist.coverImage,
          };
        }

        // Update the Details Page state
        if (state.currentPlaylist.metadata?._id === playlist._id) {
          state.currentPlaylist.metadata.coverImage = playlist.coverImage;
          state.pagination.currentPlaylist.total = totalVideos;

          // Locally filter the videos array so the video disappears immediately
          state.currentPlaylist.videos = state.currentPlaylist.videos.filter(
            (v) => v._id !== videoId
          );
        }
      })
      .addCase(removeVideoFromPlaylist.rejected, (state, action) => {
        state.loading.mutate = false;
        state.error.mutate =
          action.payload || 'failed to remove video from the playlist';
      })
      //delete playlist
      .addCase(deletePlaylist.pending, (state) => {
        state.loading.mutate = true;
        state.error.mutate = null;
      })
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.loading.mutate = false;
        const playlistId = action.payload;
        state.playlists = state.playlists.filter((p) => p._id !== playlistId);
        state.channelPlaylists = state.channelPlaylists.filter(
          (p) => p._id !== playlistId
        );

        if (state.currentPlaylist?.metadata?._id === playlistId) {
          state.currentPlaylist = initialState.currentPlaylist;
          state.pagination.currentPlaylist =
            initialState.pagination.currentPlaylist;
        }
      })
      .addCase(deletePlaylist.rejected, (state, action) => {
        state.loading.mutate = false;
        state.error.mutate = action.payload || 'failed to delete the playlist';
      })
      //update playlist
      .addCase(updatePlaylist.pending, (state) => {
        state.loading.mutate = true;
        state.error.mutate = null;
      })
      .addCase(updatePlaylist.fulfilled, (state, action) => {
        state.loading.mutate = false;
        const { playlist } = action.payload;

        //  Update Metadata if we are currently viewing this playlist
        if (state.currentPlaylist.metadata?._id === playlist._id) {
          state.currentPlaylist.metadata = {
            ...state.currentPlaylist.metadata,
            ...playlist,
          };
        }

        //  Update in the general lists
        const index = state.playlists.findIndex((p) => p._id === playlist._id);
        if (index !== -1) state.playlists[index] = playlist;
      })
      .addCase(updatePlaylist.rejected, (state, action) => {
        state.loading.mutate = false;
        state.error.mutate = action.payload || 'failed to update the playlist';
      })
      //toggle privacy status of playlist
      .addCase(togglePrivacy.pending, (state) => {
        state.loading.mutate = true;
        state.error.mutate = null;
      })
      .addCase(togglePrivacy.fulfilled, (state, action) => {
        state.loading.mutate = false;
        const { playlist } = action.payload;

        // 1. Sync Metadata
        if (state.currentPlaylist.metadata?._id === playlist._id) {
          state.currentPlaylist.metadata.privacy = playlist.privacy;
        }

        // 2. Sync Lists
        const index = state.playlists.findIndex((p) => p._id === playlist._id);
        if (index !== -1) state.playlists[index] = playlist;

        // 3. Remove from public channel view if it just became private
        // if (playlist.privacy === 'private') {
        //   state.channelPlaylists = state.channelPlaylists.filter(
        //     (p) => p._id !== playlist._id
        //   );
        // }
      })
      .addCase(togglePrivacy.rejected, (state, action) => {
        state.loading.mutate = false;
        state.error.mutate = action.payload || 'failed to update the playlist';
      });
  },
});

export default playlistSlice.reducer;
export const { resetchannelPlaylist, resetCurrentPlaylist } =
  playlistSlice.actions;
