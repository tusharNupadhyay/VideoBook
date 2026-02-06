import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

export const getChannelPlaylists = createAsyncThunk(
  'playlists/getChannelPlaylists',
  async ({ channelId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/playlists/channel/${channelId}?page=${page}&limit=${limit}`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'cannot fetch the playlists of channel'
      );
    }
  }
);

export const getMyPlaylists = createAsyncThunk(
  'playlists/getMyPlaylists',
  async ({channelId,videoId,page=1,limit=10}, { rejectWithValue }) => {
    try {
      const res = await api.get(`/playlists/channel/${channelId}`,{
        params: {
          page,
          limit,
          ...(videoId ? { videoId } : {}), // Only add videoId if it exists
        },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'cannot fetch my playlists'
      );
    }
  }
);

export const getPlaylistById = createAsyncThunk(
  'playlists/getPlaylistById',
  async ({ playlistId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/playlists/${playlistId}?page=${page}&limit=${limit}`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot fetch the playlist'
      );
    }
  }
);

export const createPlaylist = createAsyncThunk(
  'playlists/createPlaylist',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/playlists",data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot create the playlist'
      );
    }
  }
);

export const addVideoToPlaylist = createAsyncThunk(
  'playlists/addVideoToPlaylist',
  async ({playlistId,videoId}, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/playlists/${playlistId}/videos/add`,{videoId});
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot add video to playlist'
      );
    }
  }
);

export const removeVideoFromPlaylist = createAsyncThunk(
  'playlists/removeVideoFromPlaylist',
  async ({playlistId,videoId}, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/playlists/${playlistId}/videos/remove`,{videoId});
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot remove video from playlist'
      );
    }
  }
);

export const deletePlaylist = createAsyncThunk(
  'playlists/deletePlaylist',
  async ({playlistId}, { rejectWithValue }) => {
    try {
      await api.delete(`/playlists/${playlistId}`);
      return playlistId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot delete playlist'
      );
    }
  }
);

export const updatePlaylist = createAsyncThunk(
  'playlists/updatePlaylist',
  async ({playlistId,data}, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/playlists/${playlistId}`,data);
      
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot update playlist'
      );
    }
  }
);

export const togglePrivacy = createAsyncThunk('playlists/togglePrivacy',
  async({playlistId},{rejectWithValue}) => {
    try {
      const res = await api.patch(`/playlists/toggle/privacy/${playlistId}`);
      
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot toggle privacy status'
      );
    }
  }
)

