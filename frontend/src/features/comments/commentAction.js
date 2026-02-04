import api from '../../lib/axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCommentsByVideo = createAsyncThunk(
  'comment/fetchCommentsByVideo',
  async ({ videoId, page = 1 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/comments/${videoId}?page=${page}&limit=10`);
      return res.data.data; // contains { comments, hasNextPage, page, totalComments }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot fetch comments for this video'
      );
    }
  }
);

export const addComment = createAsyncThunk(
  'comment/addComment',
  async ({ videoId, commentText: content }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/comments/${videoId}`, { content });
      
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot add comment to this video'
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comment/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/comments/id/${commentId}`);
      console.log(res.data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot delete this comment'
      );
    }
  }
);

export const getCommentReactions = createAsyncThunk(
  'comment/getCommentReactions',
  async (commentId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/likes/comments/${commentId}/reactions`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch comment reactions'
      );
    }
  }
);

export const toggleCommentReaction = createAsyncThunk(
  'comment/toggleReaction',
  async ({ commentId, value }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/likes/comments/${commentId}/reaction`, {
        value,
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle reaction'
      );
    }
  }
);

export const editComment = createAsyncThunk(
  'comment/editComment',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/comments/id/${commentId}`, { content });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Cannot edit this comment'
      );
    }
  }
);
