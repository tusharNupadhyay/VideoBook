import api from '../../lib/axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchChannelStats = createAsyncThunk(
  'user/fetchChannelStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/dashboard/channel/stats');
      return res.data.data;
    } catch (error) {
      if (error.response && error.response.data?.message)
        return rejectWithValue(error.response.data.message);

      return rejectWithValue(error.message);
    }
  }
);

//fetch channel profile throught username
export const getChannelProfile = createAsyncThunk(
  'user/getChannelProfile',
  async (username, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/channel/${username}`);
      console.log(res.data.data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch Channel profile'
      );
    }
  }
);

//fetch channel profile throught username
export const getMyProfile = createAsyncThunk(
  'user/getMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/me');
      console.log(res.data.data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch Channel profile'
      );
    }
  }
);
