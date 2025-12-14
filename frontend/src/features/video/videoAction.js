import api from '../../lib/axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const uploadVideo = createAsyncThunk(
  'video/upload',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/videos', data);
      console.log(res.data?.message || 'video uploaded Successfully');
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const fetchVideoById = createAsyncThunk('video/fetchVideoById',
    async(videoId,{rejectWithValue}) => {
        try {
          const res = await api.get(`/videos/${videoId}`);
          return res.data.data;
        } catch (error) {
          return rejectWithValue(error.response?.data?.message || 'Cannot fetch video');
        }
    }
)

export const fetchAllVideos = createAsyncThunk('video/fetchAllVideos',
  async(_,{rejectWithValue}) => {
    try {
      const res = await api.get('/videos');
      console.log(res.data.data);
      return res.data.data.docs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot fetch all videos');
    }
  }
)

export const toggleVideoReaction = createAsyncThunk('video/toggleReaction',
  async({videoId,value},{rejectWithValue}) => {
    try {
      const res = await api.post(`/likes/videos/${videoId}/reaction`,{value});
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle reaction"
      );
    }
  }
)

export const getVideoReactions = createAsyncThunk(
  "video/getVideoReactions",
  async (videoId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/likes/videos/${videoId}/reactions`);
      return res.data.data; // { likes, dislikes, userReaction }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch reactions"
      );
    }
  }
);