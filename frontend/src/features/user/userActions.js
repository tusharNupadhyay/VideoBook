import api from '../../lib/axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchChannelStats = createAsyncThunk(
    'user/fetchChannelStats',
    async(_,{rejectWithValue}) => {
        try {
            const res = await api.get('/dashboard/channel/stats');
            return res.data.data;
        } catch (error) {
            if(error.response && error.response.data?.message) return rejectWithValue(error.response.data.message);

            return rejectWithValue(error.message);
        }
        
    }
)