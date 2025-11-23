import { io } from 'socket.io-client';
import { store } from '../store/store';
import {
  setSocket,
  setConnected,
  updateUserStatus,
  setUserTyping,
  removeUserTyping,
  updateVoiceChannel,
  addUserToVoiceChannel,
  removeUserFromVoiceChannel,
  updateUserVoiceState,
} from '../store/slices/socketSlice';
import {
  addMessageToChannel,
  addReactionToMessage,
  removeReactionFromMessage,
} from '../store/slices/messageSlice';
import {
  addDMMessageToConversation,
  addDMReactionToMessage,
  removeDMReactionFromMessage,
} from '../store/slices/dmSlice';
import {
  addNotification,
  setConnecting,
  setConnectionError,
} from '../store/slices/uiSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Expose socket event methods
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  connect(token) {
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    store.dispatch(setConnecting(true));
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    store.dispatch(setSocket(this.socket));

    this.setupEventListeners();
    this.authenticate(token);
  }

  authenticate(token) {
    if (this.socket) {
      this.socket.emit('authenticate', token);
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      store.dispatch(setConnected(true));
      store.dispatch(setConnecting(false));
      store.dispatch(setConnectionError(null));
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      store.dispatch(setConnected(false));
      store.dispatch(setConnectionError('Connection lost'));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      store.dispatch(setConnecting(false));
      store.dispatch(setConnectionError('Failed to connect to server'));
      
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        store.dispatch(setConnectionError('Unable to connect to server. Please refresh the page.'));
      }
    });

    // Authentication events
    this.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data.user.username);
      store.dispatch(addNotification({
        type: 'success',
        message: 'Connected to Discord Clone',
        duration: 3000,
      }));
    });

    this.socket.on('auth_error', (error) => {
      console.error('Socket auth error:', error);
      store.dispatch(setConnectionError('Authentication failed'));
      localStorage.removeItem('token');
      window.location.href = '/login';
    });

    // Message events
    this.socket.on('new_message', (message) => {
      if (message.server) {
        store.dispatch(addMessageToChannel(message));
      } else {
        store.dispatch(addDMMessageToConversation(message));
      }
      
      // Add notification if not in current channel
      const state = store.getState();
      const currentChannel = state.channels.currentChannel;
      const currentConversation = state.dm.currentConversation;
      
      if (
        (!currentChannel || currentChannel._id !== message.channel) &&
        (!currentConversation || currentConversation._id !== message.conversation)
      ) {
        store.dispatch(addNotification({
          type: 'message',
          title: message.author.username,
          message: message.content || 'Sent an attachment',
          avatar: message.author.avatar,
          channelId: message.channel,
          conversationId: message.conversation,
          duration: 5000,
        }));
      }
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      store.dispatch(setUserTyping(data));
      
      // Auto-remove typing after 5 seconds
      setTimeout(() => {
        store.dispatch(removeUserTyping({
          channelId: data.channelId,
          userId: data.userId,
        }));
      }, 5000);
    });

    this.socket.on('user_stop_typing', (data) => {
      store.dispatch(removeUserTyping(data));
    });

    // User status events
    this.socket.on('user_status_change', (data) => {
      store.dispatch(updateUserStatus(data));
    });

    // Reaction events
    this.socket.on('reaction_added', (data) => {
      if (data.serverId) {
        store.dispatch(addReactionToMessage(data));
      } else {
        store.dispatch(addDMReactionToMessage(data));
      }
    });

    this.socket.on('reaction_removed', (data) => {
      if (data.serverId) {
        store.dispatch(removeReactionFromMessage(data));
      } else {
        store.dispatch(removeDMReactionFromMessage(data));
      }
    });

    // Voice channel events
    this.socket.on('user_joined_voice', (data) => {
      store.dispatch(addUserToVoiceChannel(data));
      
      store.dispatch(addNotification({
        type: 'info',
        message: `${data.username} joined the voice channel`,
        duration: 3000,
      }));
    });

    this.socket.on('user_left_voice', (data) => {
      store.dispatch(removeUserFromVoiceChannel(data));
    });

    this.socket.on('voice_channel_update', (data) => {
      store.dispatch(updateVoiceChannel(data));
    });

    this.socket.on('user_voice_state_change', (data) => {
      store.dispatch(updateUserVoiceState(data));
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      store.dispatch(addNotification({
        type: 'error',
        message: error.message || 'An error occurred',
        duration: 5000,
      }));
    });
  }

  // Message methods
  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  joinChannel(channelId) {
    if (this.socket) {
      this.socket.emit('join_channel', channelId);
    }
  }

  leaveChannel(channelId) {
    if (this.socket) {
      this.socket.emit('leave_channel', channelId);
    }
  }

  joinServer(serverId) {
    if (this.socket) {
      this.socket.emit('join_server', serverId);
    }
  }

  leaveServer(serverId) {
    if (this.socket) {
      this.socket.emit('leave_server', serverId);
    }
  }

  // Typing methods
  startTyping(channelId, serverId = null) {
    if (this.socket) {
      this.socket.emit('typing_start', { channelId, serverId });
    }
  }

  stopTyping(channelId, serverId = null) {
    if (this.socket) {
      this.socket.emit('typing_stop', { channelId, serverId });
    }
  }

  // Status methods
  updateStatus(status, customStatus = '') {
    if (this.socket) {
      this.socket.emit('status_change', { status, customStatus });
    }
  }

  // Voice channel methods
  joinVoiceChannel(channelId, serverId) {
    if (this.socket) {
      this.socket.emit('join_voice_channel', { channelId, serverId });
    }
  }

  leaveVoiceChannel(channelId, serverId) {
    if (this.socket) {
      this.socket.emit('leave_voice_channel', { channelId, serverId });
    }
  }

  updateVoiceState(channelId, muted, deafened) {
    if (this.socket) {
      this.socket.emit('voice_state_change', { channelId, muted, deafened });
    }
  }

  // Direct message methods
  joinDM(conversationId) {
    if (this.socket) {
      this.socket.emit('join_dm', conversationId);
    }
  }

  leaveDM(conversationId) {
    if (this.socket) {
      this.socket.emit('leave_dm', conversationId);
    }
  }

  // Reaction methods
  addReaction(messageId, emoji, channelId, serverId = null) {
    if (this.socket) {
      this.socket.emit('add_reaction', { messageId, emoji, channelId, serverId });
    }
  }

  removeReaction(messageId, emoji, channelId, serverId = null) {
    if (this.socket) {
      this.socket.emit('remove_reaction', { messageId, emoji, channelId, serverId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setSocket(null));
      store.dispatch(setConnected(false));
    }
  }
}

export const socketService = new SocketService();
export default socketService;