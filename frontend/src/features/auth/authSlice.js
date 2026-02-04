import { createSlice } from '@reduxjs/toolkit';
import { registerUser, loginUser, logoutUser, fetchUser } from './authActions';
import {
  updateAccountDetails,
  updateAvatarImage,
} from '../user/userActions';

const initialState = {
  loading: false,
  userInfo: null,
  error: null,
  success: false, // no need for success flag(to navigate) , since navigation after login and register happens in try catch after await dispatch
  initialized: false, // to check user's auth status with certainity
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  //reducers are only for synchronous state changes
  reducers: {
    logout(state) {
      state.userInfo = null;
      state.success = false;
      state.error = null;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
    clearSuccess(state) {
      state.success = false;
    },
  },
  //extrareducers are for async operations and are used to deal with 3 lifecycle actions that createasyncthunk created
  extraReducers: (builder) => {
    builder
      //REGISTER BUILDER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;

        //  state.userInfo = action.payload; user info will auto log in
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || action.error.message;
      })
      // LOGIN BUILDER
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;

        state.userInfo = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || action.error.message;
      })
      //LOGOUT BUILDERS
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.success = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.payload.message;
      })
      //FETCH USER BUILDER
      //no need to set error for fetchUser since it is a session check api , it should silently validates auth without giving error
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.success = true;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.userInfo = null;
        state.loading = false;
        state.success = false;
        state.initialized = true;
      })
      //listen to update account details
      .addCase(updateAccountDetails.fulfilled, (state, action) => {
        state.userInfo.username = action.payload.username;
        state.userInfo.fullName = action.payload.fullName;
        state.userInfo.email = action.payload.email;
      })
      //listen to update avatar image
      .addCase(updateAvatarImage.fulfilled,(state,action)=>{
        state.userInfo.avatar = action.payload.avatar;
      });
  },
});

export const { clearError, clearSuccess, logout } = authSlice.actions; //good practice to export separate actions/methods
export default authSlice.reducer;
