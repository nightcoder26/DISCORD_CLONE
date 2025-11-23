const { body } = require('express-validator');
const Channel = require('../models/Channel');
const Server = require('../models/Server');
const Message = require('../models/Message');
const validate = require('../middleware/validation');

// Validation rules
const createChannelValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Channel name must be between 1 and 100 characters')
    .matches(/^[a-z0-9-_]+$/)
    .withMessage('Channel name can only contain lowercase letters, numbers, hyphens, and underscores'),
  body('type')
    .isIn(['text', 'voice'])
    .withMessage('Channel type must be either text or voice'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category name cannot exceed 50 characters')
];

// @desc    Create a new channel
// @route   POST /api/channels
// @access  Private
const createChannel = [
  ...createChannelValidation,
  validate,
  async (req, res) => {
    try {
      const { name, type, description, category, serverId, isPrivate, allowedRoles } = req.body;

      const server = await Server.findById(serverId);

      if (!server) {
        return res.status(404).json({ message: 'Server not found' });
      }

      // Check permissions
      if (!server.hasPermission(req.user.id, 'manage_channels')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const channel = new Channel({
        name,
        type,
        description,
        category,
        server: serverId,
        isPrivate: isPrivate || false,
        allowedRoles: allowedRoles || ['member']
      });

      await channel.save();

      // Add channel to server
      server.channels.push(channel._id);

      // Add to category if specified
      if (category) {
        const existingCategory = server.categories.find(cat => cat.name === category);
        if (existingCategory) {
          existingCategory.channels.push(channel._id);
        } else {
          server.categories.push({
            name: category,
            channels: [channel._id],
            position: server.categories.length
          });
        }
      }

      await server.save();

      // Emit channel created event to all server members
      if (req.io) {
        const populatedChannel = await Channel.findById(channel._id).populate('server', 'name');
        server.members.forEach(member => {
          req.io.to(`user:${member.user}`).emit('channelCreated', {
            channel: populatedChannel,
            serverId: serverId
          });
        });
      }

      res.status(201).json({
        message: 'Channel created successfully',
        channel
      });
    } catch (error) {
      console.error('Create channel error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Get channel by ID
// @route   GET /api/channels/:id
// @access  Private
const getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('server', 'name members')
      .populate('connectedUsers.user', 'username discriminator avatar');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user has access to this channel
    const server = await Server.findById(channel.server._id);
    const isMember = server.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if channel is private and user has required role
    if (channel.isPrivate) {
      const userRole = server.getMemberRole(req.user.id);
      if (!channel.allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Access denied to private channel' });
      }
    }

    res.json({ channel });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update channel
// @route   PUT /api/channels/:id
// @access  Private
const updateChannel = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Channel name must be between 1 and 100 characters')
    .matches(/^[a-z0-9-_]+$/)
    .withMessage('Channel name can only contain lowercase letters, numbers, hyphens, and underscores'),
  body('description')
    .optional()
    .isLength({ max: 1024 })
    .withMessage('Description cannot exceed 1024 characters'),
  body('topic')
    .optional()
    .isLength({ max: 1024 })
    .withMessage('Topic cannot exceed 1024 characters'),
  validate,
  async (req, res) => {
    try {
      const { name, description, topic, slowMode, userLimit, isPrivate, allowedRoles } = req.body;

      const channel = await Channel.findById(req.params.id);

      if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
      }

      const server = await Server.findById(channel.server);

      // Check permissions
      if (!server.hasPermission(req.user.id, 'manage_channels')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Update channel
      if (name) channel.name = name;
      if (description !== undefined) channel.description = description;
      if (topic !== undefined) channel.topic = topic;
      if (slowMode !== undefined) channel.slowMode = slowMode;
      if (userLimit !== undefined && channel.type === 'voice') channel.userLimit = userLimit;
      if (isPrivate !== undefined) channel.isPrivate = isPrivate;
      if (allowedRoles) channel.allowedRoles = allowedRoles;

      await channel.save();

      // Emit channel updated event to all server members
      if (req.io) {
        const server = await Server.findById(channel.server);
        server.members.forEach(member => {
          req.io.to(`user:${member.user}`).emit('channelUpdated', {
            channel: channel,
            serverId: channel.server
          });
        });
      }

      res.json({
        message: 'Channel updated successfully',
        channel
      });
    } catch (error) {
      console.error('Update channel error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Delete channel
// @route   DELETE /api/channels/:id
// @access  Private
const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const server = await Server.findById(channel.server);

    // Check permissions
    if (!server.hasPermission(req.user.id, 'manage_channels')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Remove channel from server
    server.channels = server.channels.filter(id => id.toString() !== channel._id.toString());
    
    // Remove from categories
    server.categories.forEach(category => {
      category.channels = category.channels.filter(id => id.toString() !== channel._id.toString());
    });

    await server.save();

    // Delete all messages in the channel
    await Message.deleteMany({ channel: channel._id });

    // Delete the channel
    await Channel.findByIdAndDelete(channel._id);

    // Emit channel deleted event to all server members
    if (req.io) {
      server.members.forEach(member => {
        req.io.to(`user:${member.user}`).emit('channelDeleted', {
          channelId: channel._id,
          serverId: server._id
        });
      });
    }

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get server channels
// @route   GET /api/channels/server/:serverId
// @access  Private
const getServerChannels = async (req, res) => {
  try {
    const { serverId } = req.params;

    const server = await Server.findById(serverId)
      .populate('channels');

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check if user is a member
    const isMember = server.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Filter private channels based on user role
    const userRole = server.getMemberRole(req.user.id);
    const accessibleChannels = server.channels.filter(channel => {
      if (!channel.isPrivate) return true;
      return channel.allowedRoles.includes(userRole);
    });

    res.json({ 
      channels: accessibleChannels,
      categories: server.categories
    });
  } catch (error) {
    console.error('Get server channels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join voice channel
// @route   POST /api/channels/:id/join-voice
// @access  Private
const joinVoiceChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (channel.type !== 'voice') {
      return res.status(400).json({ message: 'Not a voice channel' });
    }

    if (channel.isFull()) {
      return res.status(400).json({ message: 'Voice channel is full' });
    }

    await channel.addUser(req.user.id);

    res.json({ 
      message: 'Joined voice channel successfully',
      connectedUsers: channel.connectedUsers.length
    });
  } catch (error) {
    console.error('Join voice channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Leave voice channel
// @route   POST /api/channels/:id/leave-voice
// @access  Private
const leaveVoiceChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (channel.type !== 'voice') {
      return res.status(400).json({ message: 'Not a voice channel' });
    }

    await channel.removeUser(req.user.id);

    res.json({ 
      message: 'Left voice channel successfully',
      connectedUsers: channel.connectedUsers.length
    });
  } catch (error) {
    console.error('Leave voice channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get voice channel users
// @route   GET /api/channels/:id/voice-users
// @access  Private
const getVoiceChannelUsers = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('connectedUsers.user', 'username discriminator avatar');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (channel.type !== 'voice') {
      return res.status(400).json({ message: 'Not a voice channel' });
    }

    res.json({ 
      connectedUsers: channel.connectedUsers
    });
  } catch (error) {
    console.error('Get voice channel users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createChannel,
  getChannelById,
  updateChannel,
  deleteChannel,
  getServerChannels,
  joinVoiceChannel,
  leaveVoiceChannel,
  getVoiceChannelUsers
};