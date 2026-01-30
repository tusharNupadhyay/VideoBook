import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

export const getChannelPlaylists = createAsyncThunk(
  'playlists/getChannelPlaylists',
  async (channelId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/playlists/channel/${channelId}`);
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
  async ({channelId,videoId}, { rejectWithValue }) => {
    try {
      const res = await api.get(`/playlists/channel/${channelId}`,{
        params: videoId ? {videoId} : {}, //add videoId query parameter if videoId is passed
      });
      console.log({res});
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
  async ({playlistId}, { rejectWithValue }) => {
    try {
      const res = await api.get(`/playlists/${playlistId}`);
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
      console.log({res});
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
      console.log({res});
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
      console.log({res});
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
      const res = await api.delete(`/playlists/${playlistId}`);
      console.log({res});
      return res.data.data;
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
      console.log({res});
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
      console.log({res});
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot toggle privacy status'
      );
    }
  }
)

