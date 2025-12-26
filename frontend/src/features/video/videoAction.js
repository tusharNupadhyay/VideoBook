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
)

//fetches a video and add to user's watch history and increment a view if user is logged in 
export const fetchVideoById = createAsyncThunk('video/fetchVideoById',
    async(videoId,{rejectWithValue}) => {
        try {
          const res = await api.get(`/videos/id/${videoId}`);
          return res.data.data;
        } catch (error) {
          return rejectWithValue(error.response?.data?.message || 'Cannot fetch video');
        }
    }
)
//fetches all videos for homepage
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

//toggle like and dislike
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

//get likes and dislikes for a video
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

//fetch channel videos throught username (PUBLIC)
export const getChannelVideos = createAsyncThunk("video/getChannelVideos", async(username,{rejectWithValue})=>{
    try {
      const res = await api.get(`/videos/channel/${username}`);
      console.log(res.data.data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch Channel Videos");
    }
});

//fetch my videos throught userId (PRIVATE)
export const getMyVideos = createAsyncThunk("video/getMyVideos", async(_,{rejectWithValue})=>{
  try {
      const res = await api.get('/videos/my-videos');
      return res.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch your Videos");
  }
})

//update video details like title, description ,thumbnail
export const updateVideoDetails = createAsyncThunk("video/updateVideoDetails",async({ videoId, formData },{rejectWithValue})=>{

  try {
    const res = await api.patch(`/videos/id/${videoId}`,formData);
    console.log("updated video object: ",res.data.data);
    //update the response in myVideos array ???
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update your video details");
  }
})