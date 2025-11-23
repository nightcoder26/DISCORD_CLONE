import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchChannels = createAsyncThunk(
  'channels/fetchChannels',
  async (serverId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/channels/server/${serverId}`);
      return { serverId, channels: response.data.channels, categories: response.data.categories };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch channels');
    }
  }
);

export const createChannel = createAsyncThunk(
  'channels/createChannel',
  async (channelData, { rejectWithValue }) => {
    try {
      const response = await api.post('/channels', channelData);
      return response.data.channel;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to create channel');
    }
  }
);

export const updateChannel = createAsyncThunk(
  'channels/updateChannel',
  async ({ channelId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/channels/${channelId}`, updateData);
      return response.data.channel;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to update channel');
    }
  }
);

export const deleteChannel = createAsyncThunk(
  'channels/deleteChannel',
  async (channelId, { rejectWithValue }) => {
    try {
      await api.delete(`/channels/${channelId}`);
      return channelId;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to delete channel');
    }
  }
);

export const joinVoiceChannel = createAsyncThunk(
  'channels/joinVoiceChannel',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/channels/${channelId}/join-voice`);
      return { channelId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to join voice channel');
    }
  }
);

export const leaveVoiceChannel = createAsyncThunk(
  'channels/leaveVoiceChannel',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/channels/${channelId}/leave-voice`);
      return { channelId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to leave voice channel');
    }
  }
);

const initialState = {
  channels: {},
  categories: {},
  currentChannel: null,
  currentVoiceChannel: null,
  loading: false,
  error: null,
};

const channelSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentChannel: (state, action) => {
      state.currentChannel = action.payload;
    },
    setCurrentVoiceChannel: (state, action) => {
      state.currentVoiceChannel = action.payload;
    },
    clearCurrentChannel: (state) => {
      state.currentChannel = null;
    },
    clearCurrentVoiceChannel: (state) => {
      state.currentVoiceChannel = null;
    },
    addChannel: (state, action) => {
      const channel = action.payload;
      if (!state.channels[channel.server]) {
        state.channels[channel.server] = [];
      }
      state.channels[channel.server].push(channel);
    },
    removeChannel: (state, action) => {
      const channelId = action.payload;
      Object.keys(state.channels).forEach(serverId => {
        state.channels[serverId] = state.channels[serverId].filter(
          channel => channel._id !== channelId
        );
      });
      if (state.currentChannel && state.currentChannel._id === channelId) {
        state.currentChannel = null;
      }
      if (state.currentVoiceChannel && state.currentVoiceChannel._id === channelId) {
        state.currentVoiceChannel = null;
      }
    },
    updateChannelInList: (state, action) => {
      const updatedChannel = action.payload;
      Object.keys(state.channels).forEach(serverId => {
        const channelIndex = state.channels[serverId].findIndex(
          channel => channel._id === updatedChannel._id
        );
        if (channelIndex !== -1) {
          state.channels[serverId][channelIndex] = updatedChannel;
        }
      });
      if (state.currentChannel && state.currentChannel._id === updatedChannel._id) {
        state.currentChannel = updatedChannel;
      }
      if (state.currentVoiceChannel && state.currentVoiceChannel._id === updatedChannel._id) {
        state.currentVoiceChannel = updatedChannel;
      }
    },
    clearChannelsForServer: (state, action) => {
      const serverId = action.payload;
      delete state.channels[serverId];
      delete state.categories[serverId];
      if (state.currentChannel && state.currentChannel.server === serverId) {
        state.currentChannel = null;
      }
      if (state.currentVoiceChannel && state.currentVoiceChannel.server === serverId) {
        state.currentVoiceChannel = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch channels
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false;
        const { serverId, channels, categories } = action.payload;
        state.channels[serverId] = channels;
        state.categories[serverId] = categories;
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create channel
      .addCase(createChannel.fulfilled, (state, action) => {
        const channel = action.payload;
        if (!state.channels[channel.server]) {
          state.channels[channel.server] = [];
        }
        state.channels[channel.server].push(channel);
      })
      // Update channel
      .addCase(updateChannel.fulfilled, (state, action) => {
        const updatedChannel = action.payload;
        Object.keys(state.channels).forEach(serverId => {
          const channelIndex = state.channels[serverId].findIndex(
            channel => channel._id === updatedChannel._id
          );
          if (channelIndex !== -1) {
            state.channels[serverId][channelIndex] = updatedChannel;
          }
        });
        if (state.currentChannel && state.currentChannel._id === updatedChannel._id) {
          state.currentChannel = updatedChannel;
        }
      })
      // Delete channel
      .addCase(deleteChannel.fulfilled, (state, action) => {
        const channelId = action.payload;
        Object.keys(state.channels).forEach(serverId => {
          state.channels[serverId] = state.channels[serverId].filter(
            channel => channel._id !== channelId
          );
        });
        if (state.currentChannel && state.currentChannel._id === channelId) {
          state.currentChannel = null;
        }
        if (state.currentVoiceChannel && state.currentVoiceChannel._id === channelId) {
          state.currentVoiceChannel = null;
        }
      })
      // Join voice channel
      .addCase(joinVoiceChannel.fulfilled, (state, action) => {
        const { channelId } = action.payload;
        const channel = Object.values(state.channels)
          .flat()
          .find(ch => ch._id === channelId);
        if (channel) {
          state.currentVoiceChannel = channel;
        }
      })
      // Leave voice channel
      .addCase(leaveVoiceChannel.fulfilled, (state) => {
        state.currentVoiceChannel = null;
      });
  },
});

export const {
  clearError,
  setCurrentChannel,
  setCurrentVoiceChannel,
  clearCurrentChannel,
  clearCurrentVoiceChannel,
  addChannel,
  removeChannel,
  updateChannelInList,
  clearChannelsForServer,
} = channelSlice.actions;

export default channelSlice.reducer;