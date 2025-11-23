import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to search users');
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'users/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      const response = await api.get(`/users/${userId}`);
      console.log('getUserProfile API response:', response.data);
      return response.data.user || response.data;
    } catch (error) {
      console.error('getUserProfile API error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to get user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'users/updateUserProfile',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/profile', updateData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to update profile');
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'users/sendFriendRequest',
  async (userId, { rejectWithValue }) => {
    try {
      await api.post(`/users/${userId}/friend-request`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to send friend request');
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'users/acceptFriendRequest',
  async (userId, { rejectWithValue }) => {
    try {
      await api.put(`/users/${userId}/friend-request/accept`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to accept friend request');
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  'users/rejectFriendRequest',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}/friend-request`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to reject friend request');
    }
  }
);

export const removeFriend = createAsyncThunk(
  'users/removeFriend',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}/friend`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to remove friend');
    }
  }
);

export const getFriends = createAsyncThunk(
  'users/getFriends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/friends');
      return response.data.friends;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to get friends');
    }
  }
);

const initialState = {
  searchResults: [],
  userProfiles: {},
  friends: [],
  onlineUsers: {},
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateUserStatus: (state, action) => {
      const { userId, status, isOnline, lastSeen } = action.payload;
      state.onlineUsers[userId] = {
        status,
        isOnline,
        lastSeen
      };
      
      // Update friend status if they're in friends list
      const friendIndex = state.friends.findIndex(
        friend => friend.user._id === userId
      );
      if (friendIndex !== -1) {
        state.friends[friendIndex].user.status = status;
        state.friends[friendIndex].user.isOnline = isOnline;
        state.friends[friendIndex].user.lastSeen = lastSeen;
      }
      
      // Update user profile cache
      if (state.userProfiles[userId]) {
        state.userProfiles[userId].status = status;
        state.userProfiles[userId].isOnline = isOnline;
        state.userProfiles[userId].lastSeen = lastSeen;
      }
    },
    removeUserStatus: (state, action) => {
      const userId = action.payload;
      delete state.onlineUsers[userId];
      
      // Update friend status
      const friendIndex = state.friends.findIndex(
        friend => friend.user._id === userId
      );
      if (friendIndex !== -1) {
        state.friends[friendIndex].user.isOnline = false;
        state.friends[friendIndex].user.lastSeen = new Date().toISOString();
      }
    },
    updateFriendStatus: (state, action) => {
      const { userId, status } = action.payload;
      const friendIndex = state.friends.findIndex(
        friend => friend.user._id === userId
      );
      if (friendIndex !== -1) {
        state.friends[friendIndex].status = status;
      }
    },
    addFriend: (state, action) => {
      const friend = action.payload;
      const existingFriendIndex = state.friends.findIndex(
        f => f.user._id === friend.user._id
      );
      if (existingFriendIndex === -1) {
        state.friends.push(friend);
      } else {
        state.friends[existingFriendIndex] = friend;
      }
    },
    removeFriendFromList: (state, action) => {
      const userId = action.payload;
      state.friends = state.friends.filter(
        friend => friend.user._id !== userId
      );
    },
    cacheUserProfile: (state, action) => {
      const user = action.payload;
      state.userProfiles[user._id] = user;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get user profile
      .addCase(getUserProfile.fulfilled, (state, action) => {
        const user = action.payload;
        if (user && user._id) {
          state.userProfiles[user._id] = user;
        } else {
          console.error('getUserProfile returned invalid user data:', user);
        }
      })
      // Update user profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const user = action.payload;
        state.userProfiles[user._id] = user;
      })
      // Get friends
      .addCase(getFriends.fulfilled, (state, action) => {
        state.friends = action.payload;
      })
      // Send friend request
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        const userId = action.payload;
        // Add to friends list with pending status
        const userFromSearch = state.searchResults.find(user => user._id === userId);
        if (userFromSearch) {
          state.friends.push({
            user: userFromSearch,
            status: 'pending'
          });
        }
      })
      // Accept friend request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const userId = action.payload;
        const friendIndex = state.friends.findIndex(
          friend => friend.user._id === userId
        );
        if (friendIndex !== -1) {
          state.friends[friendIndex].status = 'accepted';
        }
      })
      // Reject friend request
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        const userId = action.payload;
        state.friends = state.friends.filter(
          friend => friend.user._id !== userId
        );
      })
      // Remove friend
      .addCase(removeFriend.fulfilled, (state, action) => {
        const userId = action.payload;
        state.friends = state.friends.filter(
          friend => friend.user._id !== userId
        );
      });
  },
});

export const {
  clearError,
  clearSearchResults,
  updateUserStatus,
  removeUserStatus,
  updateFriendStatus,
  addFriend,
  removeFriendFromList,
  cacheUserProfile,
} = userSlice.actions;

export default userSlice.reducer;