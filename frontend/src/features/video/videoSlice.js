import { createSlice } from '@reduxjs/toolkit';
import { uploadVideo ,fetchVideoById,fetchAllVideos} from './videoAction';

const initialState = {
  videos: [],          // All videos (home feed)
  homeLoading: false,
  homeError: null,  

  uploadLoading: false,
  uploadSuccess: false,
  uploadError: null,

  singleVideo: null,  // One video page (watch page)
  fetchLoading: false,
  fetchError: null,

  // For like/dislike, update, delete etc.
  actionLoading: false,
  actionError: null,
};

const videoSlice = createSlice({
name: 'video',
initialState,
reducers: {

},
extraReducers: (builder) => {
   builder
   //Upload video
    .addCase(uploadVideo.pending,(state) => {
        state.uploadLoading = true;
    })
    .addCase(uploadVideo.fulfilled,(state,action)=>{
        state.uploadLoading = false;
        state.uploadSuccess=true;
        state.videos.push(action.payload);
    })
    .addCase(uploadVideo.rejected,(state,action)=>{
        state.uploadError = action.payload;
        state.uploadLoading=false;
    })
    //fetch video by id
    .addCase(fetchVideoById.pending,(state)=>{
        state.fetchLoading = true;
    })
    .addCase(fetchVideoById.fulfilled,(state,action)=>{
        state.fetchLoading = false;
        state.fetchError=false;
        state.singleVideo = action.payload;
    })
    .addCase(fetchVideoById.rejected,(state,action)=>{
        state.fetchLoading = false;
        state.fetchError=action.payload;
        state.singleVideo=null;
    })
    //fetch all videos 
    .addCase(fetchAllVideos.pending,(state) =>{
        state.homeLoading = true;
    })
    .addCase(fetchAllVideos.fulfilled,(state,action)=>{
        state.homeLoading =false;
        state.homeError=null;
        state.videos = action.payload;
    })
    .addCase(fetchAllVideos.rejected,(state,action)=>{
        state.homeLoading=false;
        state.homeError=action.payload;
    })
}
})

export default videoSlice.reducer;