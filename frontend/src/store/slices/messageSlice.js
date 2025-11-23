import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { uploadApi } from '../../services/api';

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ channelId, page = 1, before }, { rejectWithValue }) => {
    try {
      const params = { page, limit: 50 };
      if (before) params.before = before;
      
      const response = await api.get(`/messages/channel/${channelId}`, { params });
      return { 
        channelId, 
        messages: response.data.messages, 
        hasMore: response.data.hasMore,
        page 
      };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages', messageData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to send message');
    }
  }
);

export const sendMessageWithFile = createAsyncThunk(
  'messages/sendMessageWithFile',
  async ({ formData }, { rejectWithValue }) => {
    try {
      const response = await uploadApi.post('/messages/upload', formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to send message with file');
    }
  }
);

export const editMessage = createAsyncThunk(
  'messages/editMessage',
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/messages/${messageId}`, { content });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to edit message');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await api.delete(`/messages/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to delete message');
    }
  }
);

export const addReaction = createAsyncThunk(
  'messages/addReaction',
  async ({ messageId, emoji }, { rejectWithValue }) => {
    try {
      await api.post(`/messages/${messageId}/reactions`, { emoji });
      return { messageId, emoji };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to add reaction');
    }
  }
);

export const removeReaction = createAsyncThunk(
  'messages/removeReaction',
  async ({ messageId, emoji }, { rejectWithValue }) => {
    try {
      await api.delete(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
      return { messageId, emoji };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to remove reaction');
    }
  }
);

export const togglePin = createAsyncThunk(
  'messages/togglePin',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/messages/${messageId}/pin`);
      return { messageId, pinned: response.data.pinned };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to toggle pin');
    }
  }
);

export const fetchPinnedMessages = createAsyncThunk(
  'messages/fetchPinnedMessages',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/channel/${channelId}/pinned`);
      return { channelId, messages: response.data.messages };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch pinned messages');
    }
  }
);

export const searchMessages = createAsyncThunk(
  'messages/searchMessages',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages/search', { params: searchParams });
      return response.data.messages;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to search messages');
    }
  }
);

const initialState = {
  messages: {}, // channelId -> messages array
  pinnedMessages: {}, // channelId -> pinned messages array
  searchResults: [],
  hasMore: {}, // channelId -> boolean
  loading: false,
  sendingMessage: false,
  error: null,
  editingMessage: null,
  replyingTo: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addMessageToChannel: (state, action) => {
      const message = action.payload;
      const channelId = message.channel;
      
      if (!state.messages[channelId]) {
        state.messages[channelId] = [];
      }
      
      // Check if message already exists to avoid duplicates
      const existingMessage = state.messages[channelId].find(m => m._id === message._id);
      if (!existingMessage) {
        state.messages[channelId].push(message);
        // Sort by creation date
        state.messages[channelId].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
    },
    updateMessageInChannel: (state, action) => {
      const updatedMessage = action.payload;
      const channelId = updatedMessage.channel;
      
      if (state.messages[channelId]) {
        const messageIndex = state.messages[channelId].findIndex(
          m => m._id === updatedMessage._id
        );
        if (messageIndex !== -1) {
          state.messages[channelId][messageIndex] = updatedMessage;
        }
      }
    },
    removeMessageFromChannel: (state, action) => {
      const { messageId, channelId } = action.payload;
      
      if (state.messages[channelId]) {
        state.messages[channelId] = state.messages[channelId].filter(
          m => m._id !== messageId
        );
      }
    },
    addReactionToMessage: (state, action) => {
      const { messageId, emoji, userId, username } = action.payload;
      
      Object.keys(state.messages).forEach(channelId => {
        const messageIndex = state.messages[channelId].findIndex(m => m._id === messageId);
        if (messageIndex !== -1) {
          const message = state.messages[channelId][messageIndex];
          let reaction = message.reactions?.find(r => r.emoji === emoji);
          
          if (!reaction) {
            if (!message.reactions) message.reactions = [];
            reaction = { emoji, users: [], count: 0 };
            message.reactions.push(reaction);
          }
          
          if (!reaction.users.find(u => u._id === userId)) {
            reaction.users.push({ _id: userId, username });
            reaction.count = reaction.users.length;
          }
        }
      });
    },
    removeReactionFromMessage: (state, action) => {
      const { messageId, emoji, userId } = action.payload;
      
      Object.keys(state.messages).forEach(channelId => {
        const messageIndex = state.messages[channelId].findIndex(m => m._id === messageId);
        if (messageIndex !== -1) {
          const message = state.messages[channelId][messageIndex];
          if (message.reactions) {
            const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
            if (reactionIndex !== -1) {
              const reaction = message.reactions[reactionIndex];
              reaction.users = reaction.users.filter(u => u._id !== userId);
              reaction.count = reaction.users.length;
              
              if (reaction.count === 0) {
                message.reactions.splice(reactionIndex, 1);
              }
            }
          }
        }
      });
    },
    clearMessagesForChannel: (state, action) => {
      const channelId = action.payload;
      delete state.messages[channelId];
      delete state.pinnedMessages[channelId];
      delete state.hasMore[channelId];
    },
    setEditingMessage: (state, action) => {
      state.editingMessage = action.payload;
    },
    setReplyingTo: (state, action) => {
      state.replyingTo = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { channelId, messages, hasMore, page } = action.payload;
        
        if (page === 1) {
          state.messages[channelId] = messages;
        } else {
          // Prepend older messages
          state.messages[channelId] = [...messages, ...(state.messages[channelId] || [])];
        }
        
        state.hasMore[channelId] = hasMore;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const message = action.payload;
        const channelId = message.channel;
        
        if (!state.messages[channelId]) {
          state.messages[channelId] = [];
        }
        
        // Add message if it doesn't already exist (to avoid socket duplicates)
        const existingMessage = state.messages[channelId].find(m => m._id === message._id);
        if (!existingMessage) {
          state.messages[channelId].push(message);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      })

      // Send message with file
      .addCase(sendMessageWithFile.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessageWithFile.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const message = action.payload;
        const channelId = message.channel;
        
        if (!state.messages[channelId]) {
          state.messages[channelId] = [];
        }
        
        // Add message if it doesn't already exist (to avoid socket duplicates)
        const existingMessage = state.messages[channelId].find(m => m._id === message._id);
        if (!existingMessage) {
          state.messages[channelId].push(message);
        }
      })
      .addCase(sendMessageWithFile.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      })

      // Edit message
      .addCase(editMessage.fulfilled, (state, action) => {
        const updatedMessage = action.payload;
        const channelId = updatedMessage.channel;
        
        if (state.messages[channelId]) {
          const messageIndex = state.messages[channelId].findIndex(
            m => m._id === updatedMessage._id
          );
          if (messageIndex !== -1) {
            state.messages[channelId][messageIndex] = updatedMessage;
          }
        }
        
        state.editingMessage = null;
      })
      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        
        Object.keys(state.messages).forEach(channelId => {
          const messageIndex = state.messages[channelId].findIndex(m => m._id === messageId);
          if (messageIndex !== -1) {
            state.messages[channelId][messageIndex].deleted = true;
            state.messages[channelId][messageIndex].content = '[deleted]';
          }
        });
      })
      // Toggle pin
      .addCase(togglePin.fulfilled, (state, action) => {
        const { messageId, pinned } = action.payload;
        
        Object.keys(state.messages).forEach(channelId => {
          const messageIndex = state.messages[channelId].findIndex(m => m._id === messageId);
          if (messageIndex !== -1) {
            state.messages[channelId][messageIndex].pinned = pinned;
          }
        });
      })
      // Fetch pinned messages
      .addCase(fetchPinnedMessages.fulfilled, (state, action) => {
        const { channelId, messages } = action.payload;
        state.pinnedMessages[channelId] = messages;
      })
      // Search messages
      .addCase(searchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  addMessageToChannel,
  updateMessageInChannel,
  removeMessageFromChannel,
  addReactionToMessage,
  removeReactionFromMessage,
  clearMessagesForChannel,
  setEditingMessage,
  setReplyingTo,
  clearSearchResults,
} = messageSlice.actions;

export default messageSlice.reducer;