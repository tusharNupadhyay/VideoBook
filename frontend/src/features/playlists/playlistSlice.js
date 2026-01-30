import { createSlice } from '@reduxjs/toolkit';
import { logout } from '../auth/authSlice';
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
  currentPlaylist: null,
  loading: {
    fetch: false,
    mutate: false, // create, update, add/remove video, toggle
  },
  error: {
    fetch: null,
    mutate: null,
  },
  pagination: {
    myPlaylists: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    channelPlaylists: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    currentPlaylist: {
      //for current playlist videos pagination
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //logout
      .addCase(logout, () => initialState)
      //create playlist
      .addCase(createPlaylist.pending, (state) => {
        state.loading.mutate = true;
        state.error.mutate = null;
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.loading.mutate = false;
        state.playlists.unshift(action.payload);
        state.currentPlaylist = action.payload;
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.loading.mutate = false;
        state.error.mutate = action.payload || 'failed to create playlist';
      })
      //get channel playlists
      .addCase(getChannelPlaylists.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
        state.pagination.channelPlaylists.page = 1;
      })
      .addCase(getChannelPlaylists.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.channelPlaylists = action.payload.playlists;
        state.pagination.channelPlaylists = action.payload.pagination;
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
        state.pagination.myPlaylists.page = 1;
      })
      .addCase(getMyPlaylists.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.playlists = action.payload.playlists;
        state.pagination.myPlaylists = action.payload.pagination;
      })
      .addCase(getMyPlaylists.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload || 'failed to fetch my playlists';
      })
      //fetch playlist by id
      .addCase(getPlaylistById.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
        state.pagination.currentPlaylist.page = 1;
      })
      .addCase(getPlaylistById.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.currentPlaylist = action.payload;
        state.pagination.currentPlaylist = action.payload.pagination;
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
        const { playlistId } = action.meta.arg;
        const playlist = state.playlists.find((pl) => pl._id === playlistId);
        if (playlist) playlist.hasVideo = true;

        // keep currentPlaylist in sync
        if (state.currentPlaylist && state.currentPlaylist._id === playlistId) {
          state.currentPlaylist.videos.push(action.meta.arg.videoId);
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
        const { playlistId } = action.meta.arg;
        const playlist = state.playlists.find((pl) => pl._id === playlistId);

        if (playlist) playlist.hasVideo = false;
        if (state.currentPlaylist && state.currentPlaylist._id === playlistId) {
          state.currentPlaylist.videos = state.currentPlaylist.videos.filter(
            (id) => id !== action.meta.arg.videoId
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
        state.playlists = state.playlists.filter(
          (pl) => pl._id !== action.payload
        );
        if (
          state.currentPlaylist &&
          state.currentPlaylist._id === action.payload
        ) {
          state.currentPlaylist = null;
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
        const updatedPlaylist = action.payload.playlist;

        if (
          state.currentPlaylist &&
          state.currentPlaylist._id === updatedPlaylist._id
        ) {
          // only update the playlist field, keep videos and pagination
          state.currentPlaylist = {
            ...state.currentPlaylist,
            playlist: {...updatedPlaylist},//new object reference so the page rerenders after updating
          };
        }

        const index = state.playlists.findIndex(
          (pl) => pl._id === updatedPlaylist._id
        );

        if (index !== -1) {
          state.playlists[index] = {...updatedPlaylist}; // new reference
        }
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
        const updatedPlaylist = action.payload.playlist;

        const index = state.playlists.findIndex(
          (pl) => pl._id === updatedPlaylist._id
        );

        if (index !== -1) {
          state.playlists[index] = updatedPlaylist;
        }
        if (
          state.currentPlaylist &&
          state.currentPlaylist._id === updatedPlaylist._id
        ) {
          state.currentPlaylist = updatedPlaylist;
        }
        if (updatedPlaylist.privacy === 'private') {
          state.channelPlaylists = state.channelPlaylists.filter(
            (pl) => pl._id !== updatedPlaylist._id
          );
        }
      })
      .addCase(togglePrivacy.rejected, (state, action) => {
        state.loading.mutate = false;
        state.error.mutate = action.payload || 'failed to update the playlist';
      });
  },
});

export default playlistSlice.reducer;
