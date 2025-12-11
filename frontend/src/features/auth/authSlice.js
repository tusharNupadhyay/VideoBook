import { createSlice } from '@reduxjs/toolkit';
import { registerUser, loginUser, logoutUser, fetchUser } from './authActions';

const initialState = {
  loading: false,
  userInfo: null,
  error: null,
  success: false,
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
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.success = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //FETCH USER BUILDER
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.userInfo = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.userInfo = null;
      });
  },
});

export const { clearError, clearSuccess, logout } = authSlice.actions; //good practice to export separate actions/methods
export default authSlice.reducer;
