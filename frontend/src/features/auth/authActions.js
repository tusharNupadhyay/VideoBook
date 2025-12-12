import api from '../../lib/axios';
import { createAsyncThunk } from '@reduxjs/toolkit';



//createAsyncThunk create 3 lifecycle actions: pending,fullfilled,rejected
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/register', formData);
      console.log(res.data?.message || 'registered Successfully');
      console.log(res.data);
      return res.data?.message;
    } catch (error) {
      //return custom error msg from backend if present
      if (error.response && error.response.data.message)
        return rejectWithValue(error.response.data.message);
      else return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userInfo, {dispatch, rejectWithValue }) => {

    try {
       await api.post('/users/login', userInfo); //sets the http cookies,session info,attaches auth tokens to browser,logs login attemp on backend
       const result = await dispatch(fetchUser()).unwrap(); // fetches current user details
      console.log(result || 'login Successfully');
      return result;
    } catch (error) {
      if (error.response && error.response.data.message)
        return rejectWithValue(error.response.data.message);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/logout');
      return res.data?.data;
    } catch (error) {
      if (error.response && error.response.data.message)
        return rejectWithValue(error.response.data.message);
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/current-user');
      return res.data.data;
    } catch (error) {
      //access token expired so send request to generate new refresh token
      if (error.response?.data?.message === 'TokenExpired') {
        try {
          await api.post('/users/refresh-token');

          // retry
          const res2 = await api.get('/users/current-user');
          return res2.data.data;
        } catch (err) {
          return rejectWithValue(err?.response?.data?.message || 'Session expired');
        }
      }
      return rejectWithValue('Unauthorized');
    }
  }
);
