import { createSlice } from '@reduxjs/toolkit';
import {
  getChannelProfile,
  getMyProfile,
  toggleSubscription,
  updateAccountDetails,
  updateAvatarImage,
  updateCoverImage,
  updatePassword,
} from './userActions';
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

  //subscription
  subscriptionLoading: false,
  subscriptionError: null,
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
      })
      //toggle subscription
      .addCase(toggleSubscription.pending, (state) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(toggleSubscription.fulfilled, (state, action) => {
        state.subscriptionLoading = false;
        //check if channelProfile is the one user has toggled subscription for
        if (
          state.channelProfile &&
          state.channelProfile._id === action.payload.channelId
        ) {
          const isNowSubscribed = action.payload.subscribed;
          //update the flag
          state.channelProfile.isSubscribed = isNowSubscribed;
          //update the subscriber count locally
          if (isNowSubscribed) state.channelProfile.totalSubscribers += 1;
          else state.channelProfile.totalSubscribers -= 1;
        }
      })
      .addCase(toggleSubscription.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload;
      })
      //update Account details
      .addCase(updateAccountDetails.pending, (state) => {
        state.myProfileLoading = true;
        state.myProfileError = null;
      })
      .addCase(updateAccountDetails.fulfilled, (state, action) => {
        state.myProfileLoading = false;
        state.myProfile.fullName = action.payload.fullName;
        state.myProfile.email = action.payload.email;
        state.myProfile.username = action.payload.username;
        //can also do this but more details of user will be added
        //       state.myProfile = {
        //   ...state.myProfile,
        //   ...action.payload
        // };
      })
      .addCase(updateAccountDetails.rejected, (state, action) => {
        state.myProfileLoading = false;
        state.myProfileError = action.payload;
      })
      //update avatar image
      .addCase(updateAvatarImage.pending, (state) => {
        state.myProfileLoading = true;
        state.myProfileError = null;
      })
      .addCase(updateAvatarImage.fulfilled, (state, action) => {
        state.myProfileLoading = false;
        state.myProfile.avatar = action.payload.avatar;
      })
      .addCase(updateAvatarImage.rejected, (state, action) => {
        state.myProfileLoading = false;
        state.myProfileError = action.payload;
      })
      // Update Cover Image
      .addCase(updateCoverImage.pending, (state) => {
        state.myProfileLoading = true;
        state.myProfileError = null;
      })
      .addCase(updateCoverImage.fulfilled, (state, action) => {
        state.myProfileLoading = false;
        state.myProfile.coverImage = action.payload.coverImage;
      })
      .addCase(updateCoverImage.rejected, (state, action) => {
        state.myProfileLoading = false;
        state.myProfileError = action.payload;
      })
      //update password
      .addCase(updatePassword.pending, (state) => {
        state.myProfileLoading = true;
        state.myProfileError = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.myProfileLoading = false;
        // No need to update myProfile data here since password isn't stored in state
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.myProfileLoading = false;
        state.myProfileError = action.payload;
      });
  },
});

export default userSlice.reducer;
export const { resetChannelProfile, resetMyProfile } = userSlice.actions;
