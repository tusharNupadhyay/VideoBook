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
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch Channel profile'
      );
    }
  }
);

//toggleSubscription
export const toggleSubscription = createAsyncThunk(
  'user/toggleSubscription',
  async (channelId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/subscriptions/channel/${channelId}/toggle`);
      console.log({ res });
      return {
        channelId,
        ...res.data.data,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to toggle subscription';
      return rejectWithValue(errorMessage);
    }
  }
);

//update account details
export const updateAccountDetails = createAsyncThunk(
  'user/updateAccountDetails',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.patch('/users/update-account',data);
      console.log({res});
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

//update password
export const updatePassword = createAsyncThunk(
  'user/updatePassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/change-password',data);
      console.log({res});
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update password'
      );
    }
  }
);

//update avatar image
export const updateAvatarImage = createAsyncThunk(
  'user/updateAvatarImage',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.patch('/users/avatar',data);
      console.log({res});
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update avatar image'
      );
    }
  }
);

//update coverImage 
export const updateCoverImage = createAsyncThunk(
  'user/updateCoverImage',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.patch('/users/cover-image',data);
      console.log({res});
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update cover image'
      );
    }
  }
);