import { createSlice } from '@reduxjs/toolkit';
import { fetchChannelStats } from './userActions';

const initialState = {
  stats: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.stats = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //Fetch Channel Stats
      .addCase(fetchChannelStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChannelStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchChannelStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.stats = null;
      });
  },
});

export default userSlice.reducer;
export const { resetUserState } = userSlice.actions;
