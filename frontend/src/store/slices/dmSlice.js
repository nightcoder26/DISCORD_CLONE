import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'dm/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dm/conversations');
      return response.data.conversations;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch conversations');
    }
  }
);

export const createConversation = createAsyncThunk(
  'dm/createConversation',
  async (participants, { rejectWithValue }) => {
    try {
      const response = await api.post('/dm/conversations', { participants });
      return response.data.conversation;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to create conversation');
    }
  }
);

export const fetchDMMessages = createAsyncThunk(
  'dm/fetchDMMessages',
  async ({ conversationId, page = 1, before }, { rejectWithValue }) => {
    try {
      const params = { page, limit: 50 };
      if (before) params.before = before;
      
      console.log('Fetching DM messages for user ID:', conversationId);
      // conversationId is actually the userId in our system
      const response = await api.get(`/dm/${conversationId}`, { params });
      console.log('DM messages response:', response.data);
      
      return { 
        conversationId, 
        messages: response.data.messages || response.data, 
        hasMore: response.data.hasMore || false,
        page 
      };
    } catch (error) {
      console.error('Fetch DM messages error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch DM messages');
    }
  }
);

export const sendDMMessage = createAsyncThunk(
  'dm/sendDMMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      console.log('Sending DM message:', messageData);
      const response = await api.post('/dm', messageData);
      console.log('DM message response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Send DM message error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to send DM message');
    }
  }
);

export const editDMMessage = createAsyncThunk(
  'dm/editDMMessage',
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/dm/messages/${messageId}`, { content });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to edit DM message');
    }
  }
);

export const deleteDMMessage = createAsyncThunk(
  'dm/deleteDMMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await api.delete(`/dm/messages/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to delete DM message');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'dm/markAsRead',
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      const payload = messageId ? { messageId } : {};
      await api.put(`/dm/conversations/${conversationId}/read`, payload);
      return { conversationId, messageId };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to mark as read');
    }
  }
);

export const addDMReaction = createAsyncThunk(
  'dm/addDMReaction',
  async ({ messageId, emoji }, { rejectWithValue }) => {
    try {
      await api.post(`/dm/messages/${messageId}/reactions`, { emoji });
      return { messageId, emoji };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to add reaction');
    }
  }
);

export const removeDMReaction = createAsyncThunk(
  'dm/removeDMReaction',
  async ({ messageId, emoji }, { rejectWithValue }) => {
    try {
      await api.delete(`/dm/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
      return { messageId, emoji };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to remove reaction');
    }
  }
);

const initialState = {
  conversations: [],
  messages: {}, // conversationId -> messages array
  currentConversation: null,
  hasMore: {}, // conversationId -> boolean
  loading: false,
  sendingMessage: false,
  error: null,
  editingMessage: null,
  replyingTo: null,
};

const dmSlice = createSlice({
  name: 'dm',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
    },
    addConversation: (state, action) => {
      const conversation = action.payload;
      const existingIndex = state.conversations.findIndex(c => c._id === conversation._id);
      if (existingIndex === -1) {
        state.conversations.unshift(conversation);
      } else {
        state.conversations[existingIndex] = conversation;
      }
    },
    updateConversation: (state, action) => {
      const updatedConversation = action.payload;
      const index = state.conversations.findIndex(c => c._id === updatedConversation._id);
      if (index !== -1) {
        state.conversations[index] = updatedConversation;
        // Move to top
        const conversation = state.conversations.splice(index, 1)[0];
        state.conversations.unshift(conversation);
      }
    },
    addDMMessageToConversation: (state, action) => {
      const message = action.payload;
      const conversationId = message.conversation;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Check if message already exists to avoid duplicates
      const existingMessage = state.messages[conversationId].find(m => m._id === message._id);
      if (!existingMessage) {
        state.messages[conversationId].push(message);
        // Sort by creation date
        state.messages[conversationId].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
      
      // Update conversation's last message and activity
      const conversationIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        state.conversations[conversationIndex].lastActivity = message.createdAt;
        
        // Move conversation to top
        const conversation = state.conversations.splice(conversationIndex, 1)[0];
        state.conversations.unshift(conversation);
      }
    },
    updateDMMessageInConversation: (state, action) => {
      const updatedMessage = action.payload;
      const conversationId = updatedMessage.conversation;
      
      if (state.messages[conversationId]) {
        const messageIndex = state.messages[conversationId].findIndex(
          m => m._id === updatedMessage._id
        );
        if (messageIndex !== -1) {
          state.messages[conversationId][messageIndex] = updatedMessage;
        }
      }
    },
    removeDMMessageFromConversation: (state, action) => {
      const { messageId, conversationId } = action.payload;
      
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].filter(
          m => m._id !== messageId
        );
      }
    },
    addDMReactionToMessage: (state, action) => {
      const { messageId, emoji, userId, username } = action.payload;
      
      Object.keys(state.messages).forEach(conversationId => {
        const messageIndex = state.messages[conversationId].findIndex(m => m._id === messageId);
        if (messageIndex !== -1) {
          const message = state.messages[conversationId][messageIndex];
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
    removeDMReactionFromMessage: (state, action) => {
      const { messageId, emoji, userId } = action.payload;
      
      Object.keys(state.messages).forEach(conversationId => {
        const messageIndex = state.messages[conversationId].findIndex(m => m._id === messageId);
        if (messageIndex !== -1) {
          const message = state.messages[conversationId][messageIndex];
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
    clearMessagesForConversation: (state, action) => {
      const conversationId = action.payload;
      delete state.messages[conversationId];
      delete state.hasMore[conversationId];
    },
    setEditingDMMessage: (state, action) => {
      state.editingMessage = action.payload;
    },
    setReplyingToDM: (state, action) => {
      state.replyingTo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const conversation = action.payload;
        const existingIndex = state.conversations.findIndex(c => c._id === conversation._id);
        if (existingIndex === -1) {
          state.conversations.unshift(conversation);
        }
        state.currentConversation = conversation;
      })
      // Fetch DM messages
      .addCase(fetchDMMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDMMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages, hasMore, page } = action.payload;
        
        if (page === 1) {
          state.messages[conversationId] = messages;
        } else {
          // Prepend older messages
          state.messages[conversationId] = [...messages, ...(state.messages[conversationId] || [])];
        }
        
        state.hasMore[conversationId] = hasMore;
      })
      .addCase(fetchDMMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send DM message
      .addCase(sendDMMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendDMMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const message = action.payload;
        const conversationId = message.conversation;
        
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        
        // Add message if it doesn't already exist (to avoid socket duplicates)
        const existingMessage = state.messages[conversationId].find(m => m._id === message._id);
        if (!existingMessage) {
          state.messages[conversationId].push(message);
        }
        
        // Update conversation
        const conversationIndex = state.conversations.findIndex(c => c._id === conversationId);
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = message;
          state.conversations[conversationIndex].lastActivity = message.createdAt;
          
          // Move to top
          const conversation = state.conversations.splice(conversationIndex, 1)[0];
          state.conversations.unshift(conversation);
        }
        
        // Clear reply state
        state.replyingTo = null;
      })
      .addCase(sendDMMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      })
      // Edit DM message
      .addCase(editDMMessage.fulfilled, (state, action) => {
        const updatedMessage = action.payload;
        const conversationId = updatedMessage.conversation;
        
        if (state.messages[conversationId]) {
          const messageIndex = state.messages[conversationId].findIndex(
            m => m._id === updatedMessage._id
          );
          if (messageIndex !== -1) {
            state.messages[conversationId][messageIndex] = updatedMessage;
          }
        }
        
        state.editingMessage = null;
      })
      // Delete DM message
      .addCase(deleteDMMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        
        Object.keys(state.messages).forEach(conversationId => {
          const messageIndex = state.messages[conversationId].findIndex(m => m._id === messageId);
          if (messageIndex !== -1) {
            state.messages[conversationId][messageIndex].deleted = true;
            state.messages[conversationId][messageIndex].content = '[deleted]';
          }
        });
      });
  },
});

export const {
  clearError,
  setCurrentConversation,
  clearCurrentConversation,
  addConversation,
  updateConversation,
  addDMMessageToConversation,
  updateDMMessageInConversation,
  removeDMMessageFromConversation,
  addDMReactionToMessage,
  removeDMReactionFromMessage,
  clearMessagesForConversation,
  setEditingDMMessage,
  setReplyingToDM,
} = dmSlice.actions;

export default dmSlice.reducer;