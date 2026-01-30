import { createSlice } from '@reduxjs/toolkit';
import { getChannelProfile, getMyProfile } from './userActions';
import { logout } from '../auth/authSlice';

const initialState = {
  // PUBLIC CHANNEL PROFILE (by username)
  channelProfile: null,
  channelLoading: false,
  channelError: null,

  // PRIVATE PROFILE (logged-in user)
  myProfile: null,
  myProfileLoading: false,
  myProfileError: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetChannelProfile: (state) => {
      state.channelProfile = null;
      state.channelLoading = false;
      state.channelError = null;
    },
    resetMyProfile: (state) => {
      state.myProfile = null;
      state.myProfileLoading = false;
      state.myProfileError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //logout
      .addCase(logout, () => initialState)
      //Fetch Public channel
      .addCase(getChannelProfile.pending, (state) => {
        state.channelLoading = true;
        state.channelError = null;
      })
      .addCase(getChannelProfile.fulfilled, (state, action) => {
        state.channelLoading = false;
        state.channelProfile = action.payload;
      })
      .addCase(getChannelProfile.rejected, (state, action) => {
        state.channelLoading = false;
        state.channelError = action.payload || action.error.message;
      })
      // MY PROFILE
      .addCase(getMyProfile.pending, (state) => {
        state.myProfileLoading = true;
        state.myProfileError = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.myProfileLoading = false;
        state.myProfile = action.payload;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.myProfileLoading = false;
        state.myProfileError = action.payload;
      });
  },
});

export default userSlice.reducer;
export const { resetChannelProfile, resetMyProfile } = userSlice.actions;
