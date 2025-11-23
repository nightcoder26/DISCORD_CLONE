const User = require('../models/User');

// Socket.io event handlers
const socketHandler = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', async (token) => {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user) {
          socket.userId = user._id.toString();
          socket.user = user;
          connectedUsers.set(socket.userId, socket.id);
          
          // Update user online status
          await User.findByIdAndUpdate(user._id, {
            isOnline: true,
            lastSeen: new Date()
          });

          // Join user to their servers' rooms
          if (user.servers) {
            user.servers.forEach(serverId => {
              socket.join(`server_${serverId}`);
            });
          }

          // Notify friends about online status
          socket.broadcast.emit('user_status_change', {
            userId: user._id,
            status: 'online',
            username: user.username,
            discriminator: user.discriminator
          });

          socket.emit('authenticated', { user: user.toJSON() });
          console.log(`User authenticated: ${user.username}#${user.discriminator}`);
        }
      } catch (error) {
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Handle joining servers
    socket.on('join_server', (serverId) => {
      socket.join(`server_${serverId}`);
      console.log(`User ${socket.userId} joined server ${serverId}`);
    });

    // Handle leaving servers
    socket.on('leave_server', (serverId) => {
      socket.leave(`server_${serverId}`);
      console.log(`User ${socket.userId} left server ${serverId}`);
    });

    // Handle joining channels
    socket.on('join_channel', (channelId) => {
      socket.join(`channel_${channelId}`);
      console.log(`User ${socket.userId} joined channel ${channelId}`);
    });

    // Handle leaving channels
    socket.on('leave_channel', (channelId) => {
      socket.leave(`channel_${channelId}`);
      console.log(`User ${socket.userId} left channel ${channelId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { channelId, content, serverId, replyTo } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Create message in database (this would be handled by message controller)
        const messageData = {
          content,
          author: socket.userId,
          channel: channelId,
          server: serverId,
          replyTo: replyTo || null,
          timestamp: new Date()
        };

        // Emit to all users in the channel
        if (serverId) {
          io.to(`channel_${channelId}`).emit('new_message', messageData);
        } else {
          // Direct message
          io.to(`dm_${channelId}`).emit('new_message', messageData);
        }

        console.log(`Message sent in channel ${channelId} by user ${socket.userId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { channelId, serverId } = data;
      if (serverId) {
        socket.to(`channel_${channelId}`).emit('user_typing', {
          userId: socket.userId,
          username: socket.user?.username,
          channelId
        });
      } else {
        socket.to(`dm_${channelId}`).emit('user_typing', {
          userId: socket.userId,
          username: socket.user?.username,
          channelId
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { channelId, serverId } = data;
      if (serverId) {
        socket.to(`channel_${channelId}`).emit('user_stop_typing', {
          userId: socket.userId,
          channelId
        });
      } else {
        socket.to(`dm_${channelId}`).emit('user_stop_typing', {
          userId: socket.userId,
          channelId
        });
      }
    });

    // Handle voice channel events
    socket.on('join_voice_channel', async (data) => {
      const { channelId, serverId } = data;
      
      try {
        const Channel = require('../models/Channel');
        const channel = await Channel.findById(channelId);
        
        if (channel && channel.type === 'voice' && !channel.isFull()) {
          await channel.addUser(socket.userId);
          
          socket.join(`voice_${channelId}`);
          
          // Notify other users in the voice channel
          socket.to(`voice_${channelId}`).emit('user_joined_voice', {
            userId: socket.userId,
            username: socket.user?.username,
            avatar: socket.user?.avatar
          });

          // Notify server members about voice channel activity
          io.to(`server_${serverId}`).emit('voice_channel_update', {
            channelId,
            connectedUsers: channel.connectedUsers.length
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join voice channel' });
      }
    });

    socket.on('leave_voice_channel', async (data) => {
      const { channelId, serverId } = data;
      
      try {
        const Channel = require('../models/Channel');
        const channel = await Channel.findById(channelId);
        
        if (channel && channel.type === 'voice') {
          await channel.removeUser(socket.userId);
          
          socket.leave(`voice_${channelId}`);
          
          // Notify other users in the voice channel
          socket.to(`voice_${channelId}`).emit('user_left_voice', {
            userId: socket.userId
          });

          // Notify server members about voice channel activity
          io.to(`server_${serverId}`).emit('voice_channel_update', {
            channelId,
            connectedUsers: channel.connectedUsers.length
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to leave voice channel' });
      }
    });

    // Handle voice state changes (mute, deafen, etc.)
    socket.on('voice_state_change', async (data) => {
      const { channelId, muted, deafened } = data;
      
      try {
        const Channel = require('../models/Channel');
        const channel = await Channel.findById(channelId);
        
        if (channel && channel.type === 'voice') {
          await channel.updateUserState(socket.userId, { muted, deafened });
          
          // Notify other users in the voice channel
          socket.to(`voice_${channelId}`).emit('user_voice_state_change', {
            userId: socket.userId,
            muted,
            deafened
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to update voice state' });
      }
    });

    // Handle status changes
    socket.on('status_change', async (data) => {
      try {
        const { status, customStatus } = data;
        
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            status,
            customStatus: customStatus || ''
          });

          // Notify friends and servers about status change
          socket.broadcast.emit('user_status_change', {
            userId: socket.userId,
            status,
            customStatus,
            username: socket.user?.username,
            discriminator: socket.user?.discriminator
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle direct message conversations
    socket.on('join_dm', (conversationId) => {
      socket.join(`dm_${conversationId}`);
      console.log(`User ${socket.userId} joined DM conversation ${conversationId}`);
    });

    socket.on('leave_dm', (conversationId) => {
      socket.leave(`dm_${conversationId}`);
      console.log(`User ${socket.userId} left DM conversation ${conversationId}`);
    });

    // Handle reactions
    socket.on('add_reaction', (data) => {
      const { messageId, emoji, channelId, serverId } = data;
      
      const reactionData = {
        messageId,
        emoji,
        userId: socket.userId,
        username: socket.user?.username
      };

      if (serverId) {
        socket.to(`channel_${channelId}`).emit('reaction_added', reactionData);
      } else {
        socket.to(`dm_${channelId}`).emit('reaction_added', reactionData);
      }
    });

    socket.on('remove_reaction', (data) => {
      const { messageId, emoji, channelId, serverId } = data;
      
      const reactionData = {
        messageId,
        emoji,
        userId: socket.userId
      };

      if (serverId) {
        socket.to(`channel_${channelId}`).emit('reaction_removed', reactionData);
      } else {
        socket.to(`dm_${channelId}`).emit('reaction_removed', reactionData);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);
      
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        
        // Update user offline status
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        });

        // Notify friends about offline status
        socket.broadcast.emit('user_status_change', {
          userId: socket.userId,
          status: 'offline',
          username: socket.user?.username,
          discriminator: socket.user?.discriminator
        });

        // Leave all voice channels
        const Channel = require('../models/Channel');
        const voiceChannels = await Channel.find({
          type: 'voice',
          'connectedUsers.user': socket.userId
        });

        for (const channel of voiceChannels) {
          await channel.removeUser(socket.userId);
          socket.to(`voice_${channel._id}`).emit('user_left_voice', {
            userId: socket.userId
          });
        }
      }
    });
  });

  return io;
};

module.exports = socketHandler;