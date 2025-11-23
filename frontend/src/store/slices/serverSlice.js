import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchUserServers = createAsyncThunk(
  'servers/fetchUserServers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/servers');
      return response.data.servers;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch servers');
    }
  }
);

export const fetchServerById = createAsyncThunk(
  'servers/fetchServerById',
  async (serverId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/servers/${serverId}`);
      return response.data.server;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch server');
    }
  }
);

export const createServer = createAsyncThunk(
  'servers/createServer',
  async (serverData, { rejectWithValue }) => {
    try {
      const response = await api.post('/servers', serverData);
      return response.data.server;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to create server');
    }
  }
);

export const updateServer = createAsyncThunk(
  'servers/updateServer',
  async ({ serverId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/servers/${serverId}`, updateData);
      return response.data.server;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to update server');
    }
  }
);

export const deleteServer = createAsyncThunk(
  'servers/deleteServer',
  async (serverId, { rejectWithValue }) => {
    try {
      await api.delete(`/servers/${serverId}`);
      return serverId;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to delete server');
    }
  }
);

export const joinServer = createAsyncThunk(
  'servers/joinServer',
  async (inviteCode, { rejectWithValue }) => {
    try {
      const response = await api.post(`/servers/join/${inviteCode}`);
      return response.data.server;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to join server');
    }
  }
);

export const leaveServer = createAsyncThunk(
  'servers/leaveServer',
  async (serverId, { rejectWithValue }) => {
    try {
      await api.post(`/servers/${serverId}/leave`);
      return serverId;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to leave server');
    }
  }
);

export const fetchServerMembers = createAsyncThunk(
  'servers/fetchServerMembers',
  async (serverId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/servers/${serverId}/members`);
      return { serverId, members: response.data.members };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch members');
    }
  }
);

export const kickMember = createAsyncThunk(
  'servers/kickMember',
  async ({ serverId, userId }, { rejectWithValue }) => {
    try {
      await api.delete(`/servers/${serverId}/members/${userId}`);
      return { serverId, userId };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to kick member');
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'servers/updateMemberRole',
  async ({ serverId, userId, role }, { rejectWithValue }) => {
    try {
      await api.put(`/servers/${serverId}/members/${userId}/role`, { role });
      return { serverId, userId, role };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to update member role');
    }
  }
);

const initialState = {
  servers: [],
  currentServer: null,
  serverMembers: {},
  loading: false,
  error: null,
};

const serverSlice = createSlice({
  name: 'servers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentServer: (state, action) => {
      state.currentServer = action.payload;
    },
    clearCurrentServer: (state) => {
      state.currentServer = null;
    },
    addServer: (state, action) => {
      state.servers.push(action.payload);
    },
    removeServer: (state, action) => {
      state.servers = state.servers.filter(server => server._id !== action.payload);
      if (state.currentServer && state.currentServer._id === action.payload) {
        state.currentServer = null;
      }
    },
    updateServerInList: (state, action) => {
      const index = state.servers.findIndex(server => server._id === action.payload._id);
      if (index !== -1) {
        state.servers[index] = action.payload;
      }
      if (state.currentServer && state.currentServer._id === action.payload._id) {
        state.currentServer = action.payload;
      }
    },
    addMemberToServer: (state, action) => {
      const { serverId, member } = action.payload;
      if (state.serverMembers[serverId]) {
        state.serverMembers[serverId].push(member);
      }
      // Update current server if it matches
      if (state.currentServer && state.currentServer._id === serverId) {
        state.currentServer.members.push(member);
      }
    },
    removeMemberFromServer: (state, action) => {
      const { serverId, userId } = action.payload;
      if (state.serverMembers[serverId]) {
        state.serverMembers[serverId] = state.serverMembers[serverId].filter(
          member => member.user._id !== userId
        );
      }
      // Update current server if it matches
      if (state.currentServer && state.currentServer._id === serverId) {
        state.currentServer.members = state.currentServer.members.filter(
          member => member.user._id !== userId
        );
      }
    },
    updateMemberInServer: (state, action) => {
      const { serverId, userId, updates } = action.payload;
      if (state.serverMembers[serverId]) {
        const memberIndex = state.serverMembers[serverId].findIndex(
          member => member.user._id === userId
        );
        if (memberIndex !== -1) {
          state.serverMembers[serverId][memberIndex] = {
            ...state.serverMembers[serverId][memberIndex],
            ...updates
          };
        }
      }
      // Update current server if it matches
      if (state.currentServer && state.currentServer._id === serverId) {
        const memberIndex = state.currentServer.members.findIndex(
          member => member.user._id === userId
        );
        if (memberIndex !== -1) {
          state.currentServer.members[memberIndex] = {
            ...state.currentServer.members[memberIndex],
            ...updates
          };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user servers
      .addCase(fetchUserServers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserServers.fulfilled, (state, action) => {
        state.loading = false;
        state.servers = action.payload;
      })
      .addCase(fetchUserServers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch server by ID
      .addCase(fetchServerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentServer = action.payload;
        // Update server in list if it exists
        const serverIndex = state.servers.findIndex(s => s._id === action.payload._id);
        if (serverIndex !== -1) {
          state.servers[serverIndex] = action.payload;
        }
      })
      .addCase(fetchServerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create server
      .addCase(createServer.fulfilled, (state, action) => {
        state.servers.push(action.payload);
      })
      // Update server
      .addCase(updateServer.fulfilled, (state, action) => {
        const index = state.servers.findIndex(server => server._id === action.payload._id);
        if (index !== -1) {
          state.servers[index] = action.payload;
        }
        if (state.currentServer && state.currentServer._id === action.payload._id) {
          state.currentServer = action.payload;
        }
      })
      // Delete server
      .addCase(deleteServer.fulfilled, (state, action) => {
        state.servers = state.servers.filter(server => server._id !== action.payload);
        if (state.currentServer && state.currentServer._id === action.payload) {
          state.currentServer = null;
        }
        delete state.serverMembers[action.payload];
      })
      // Join server
      .addCase(joinServer.fulfilled, (state, action) => {
        state.servers.push(action.payload);
      })
      // Leave server
      .addCase(leaveServer.fulfilled, (state, action) => {
        state.servers = state.servers.filter(server => server._id !== action.payload);
        if (state.currentServer && state.currentServer._id === action.payload) {
          state.currentServer = null;
        }
        delete state.serverMembers[action.payload];
      })
      // Fetch server members
      .addCase(fetchServerMembers.fulfilled, (state, action) => {
        const { serverId, members } = action.payload;
        state.serverMembers[serverId] = members;
      })
      // Kick member
      .addCase(kickMember.fulfilled, (state, action) => {
        const { serverId, userId } = action.payload;
        if (state.serverMembers[serverId]) {
          state.serverMembers[serverId] = state.serverMembers[serverId].filter(
            member => member.user._id !== userId
          );
        }
        if (state.currentServer && state.currentServer._id === serverId) {
          state.currentServer.members = state.currentServer.members.filter(
            member => member.user._id !== userId
          );
        }
      })
      // Update member role
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const { serverId, userId, role } = action.payload;
        if (state.serverMembers[serverId]) {
          const memberIndex = state.serverMembers[serverId].findIndex(
            member => member.user._id === userId
          );
          if (memberIndex !== -1) {
            state.serverMembers[serverId][memberIndex].role = role;
          }
        }
        if (state.currentServer && state.currentServer._id === serverId) {
          const memberIndex = state.currentServer.members.findIndex(
            member => member.user._id === userId
          );
          if (memberIndex !== -1) {
            state.currentServer.members[memberIndex].role = role;
          }
        }
      });
  },
});

export const {
  clearError,
  setCurrentServer,
  clearCurrentServer,
  addServer,
  removeServer,
  updateServerInList,
  addMemberToServer,
  removeMemberFromServer,
  updateMemberInServer,
} = serverSlice.actions;

export default serverSlice.reducer;