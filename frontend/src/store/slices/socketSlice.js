import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  socket: null,
  connected: false,
  onlineUsers: {},
  typingUsers: {},
  voiceChannels: {},
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    updateUserStatus: (state, action) => {
      const { userId, status, isOnline } = action.payload;
      state.onlineUsers[userId] = {
        status,
        isOnline,
        lastSeen: new Date().toISOString()
      };
    },
    removeUserStatus: (state, action) => {
      delete state.onlineUsers[action.payload];
    },
    setUserTyping: (state, action) => {
      const { channelId, userId, username } = action.payload;
      if (!state.typingUsers[channelId]) {
        state.typingUsers[channelId] = {};
      }
      state.typingUsers[channelId][userId] = {
        username,
        timestamp: Date.now()
      };
    },
    removeUserTyping: (state, action) => {
      const { channelId, userId } = action.payload;
      if (state.typingUsers[channelId]) {
        delete state.typingUsers[channelId][userId];
        if (Object.keys(state.typingUsers[channelId]).length === 0) {
          delete state.typingUsers[channelId];
        }
      }
    },
    clearTypingUsers: (state, action) => {
      const channelId = action.payload;
      delete state.typingUsers[channelId];
    },
    updateVoiceChannel: (state, action) => {
      const { channelId, connectedUsers } = action.payload;
      state.voiceChannels[channelId] = {
        connectedUsers,
        lastUpdated: Date.now()
      };
    },
    addUserToVoiceChannel: (state, action) => {
      const { channelId, user } = action.payload;
      if (!state.voiceChannels[channelId]) {
        state.voiceChannels[channelId] = { connectedUsers: [] };
      }
      const existingUserIndex = state.voiceChannels[channelId].connectedUsers.findIndex(
        u => u.userId === user.userId
      );
      if (existingUserIndex === -1) {
        state.voiceChannels[channelId].connectedUsers.push(user);
      }
    },
    removeUserFromVoiceChannel: (state, action) => {
      const { channelId, userId } = action.payload;
      if (state.voiceChannels[channelId]) {
        state.voiceChannels[channelId].connectedUsers = 
          state.voiceChannels[channelId].connectedUsers.filter(u => u.userId !== userId);
        
        if (state.voiceChannels[channelId].connectedUsers.length === 0) {
          delete state.voiceChannels[channelId];
        }
      }
    },
    updateUserVoiceState: (state, action) => {
      const { channelId, userId, voiceState } = action.payload;
      if (state.voiceChannels[channelId]) {
        const userIndex = state.voiceChannels[channelId].connectedUsers.findIndex(
          u => u.userId === userId
        );
        if (userIndex !== -1) {
          state.voiceChannels[channelId].connectedUsers[userIndex] = {
            ...state.voiceChannels[channelId].connectedUsers[userIndex],
            ...voiceState
          };
        }
      }
    },
    clearAllSocketData: (state) => {
      state.socket = null;
      state.connected = false;
      state.onlineUsers = {};
      state.typingUsers = {};
      state.voiceChannels = {};
    },
  },
});

export const {
  setSocket,
  setConnected,
  updateUserStatus,
  removeUserStatus,
  setUserTyping,
  removeUserTyping,
  clearTypingUsers,
  updateVoiceChannel,
  addUserToVoiceChannel,
  removeUserFromVoiceChannel,
  updateUserVoiceState,
  clearAllSocketData,
} = socketSlice.actions;

export default socketSlice.reducer;