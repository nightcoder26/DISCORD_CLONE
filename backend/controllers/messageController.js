const { body } = require('express-validator');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const Server = require('../models/Server');
const validate = require('../middleware/validation');
const upload = require('../middleware/upload');

// Validation rules
const sendMessageValidation = [
  body('content')
    .optional()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  body('channelId')
    .isMongoId()
    .withMessage('Invalid channel ID')
];

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = [
  ...sendMessageValidation,
  validate,
  async (req, res) => {
    try {
      const { content, channelId, replyTo, attachments, embeds } = req.body;

      if (!content && (!attachments || attachments.length === 0)) {
        return res.status(400).json({ message: 'Message must have content or attachments' });
      }

      const channel = await Channel.findById(channelId);

      if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
      }

      const server = await Server.findById(channel.server);

      // Check if user is a member and has permission to send messages
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

      // Check if user has permission to send messages
      if (!server.hasPermission(req.user.id, 'send_messages')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const message = new Message({
        content,
        author: req.user.id,
        channel: channelId,
        server: channel.server,
        replyTo: replyTo || null,
        attachments: attachments || [],
        embeds: embeds || []
      });

      await message.save();

      // Update channel's last message and message count
      channel.lastMessage = message._id;
      channel.messageCount += 1;
      await channel.save();

      // Populate the message for response
      const populatedMessage = await Message.findById(message._id)
        .populate('author', 'username discriminator avatar')
        .populate('replyTo', 'content author')
        .populate({
          path: 'replyTo',
          populate: {
            path: 'author',
            select: 'username discriminator avatar'
          }
        });

      // Emit real-time message to all users in the channel
      if (req.io) {
        const socketData = {
          _id: populatedMessage._id,
          content: populatedMessage.content,
          author: populatedMessage.author,
          channel: populatedMessage.channel,
          server: populatedMessage.server,
          replyTo: populatedMessage.replyTo,
          attachments: populatedMessage.attachments,
          embeds: populatedMessage.embeds,
          createdAt: populatedMessage.createdAt,
          updatedAt: populatedMessage.updatedAt
        };

        // Emit to all users in the channel
        req.io.to(`channel_${channelId}`).emit('new_message', socketData);
      }

      res.status(201).json({
        message: 'Message sent successfully',
        data: populatedMessage
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Send a message with file attachment
// @route   POST /api/messages/upload
// @access  Private
const sendMessageWithFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { channelId, content } = req.body;
      const file = req.file;

      if (!file && !content) {
        return res.status(400).json({ message: 'Message must have content or file attachment' });
      }

      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
      }

      const server = await Server.findById(channel.server);

      // Check if user is a member and has permission to send messages
      const isMember = server.members.some(member => 
        member.user.toString() === req.user.id
      );

      if (!isMember) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if user has permission to send messages
      if (!server.hasPermission(req.user.id, 'send_messages')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Prepare attachment data
      const attachments = [];
      if (file) {
        attachments.push({
          filename: file.originalname,
          url: `/uploads/${file.filename}`,
          size: file.size,
          contentType: file.mimetype
        });
      }

      const message = new Message({
        content: content || '',
        author: req.user.id,
        channel: channelId,
        server: channel.server,
        attachments: attachments
      });

      await message.save();

      // Update channel's last message and message count
      channel.lastMessage = message._id;
      channel.messageCount += 1;
      await channel.save();

      // Populate the message for response
      const populatedMessage = await Message.findById(message._id)
        .populate('author', 'username discriminator avatar');

      // Emit real-time message to all users in the channel
      if (req.io) {
        const socketData = {
          _id: populatedMessage._id,
          content: populatedMessage.content,
          author: populatedMessage.author,
          channel: populatedMessage.channel,
          server: populatedMessage.server,
          attachments: populatedMessage.attachments,
          createdAt: populatedMessage.createdAt,
          updatedAt: populatedMessage.updatedAt
        };

        req.io.to(`channel_${channelId}`).emit('new_message', socketData);
      }

      res.status(201).json({
        message: 'Message with file sent successfully',
        data: populatedMessage
      });
    } catch (error) {
      console.error('Send message with file error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Get channel messages
// @route   GET /api/messages/channel/:channelId
// @access  Private
const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50, before } = req.query;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const server = await Server.findById(channel.server);

    // Check if user is a member
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

    const query = { 
      channel: channelId,
      deleted: false
    };

    // If 'before' parameter is provided, get messages before that message ID
    if (before) {
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    const messages = await Message.find(query)
      .populate('author', 'username discriminator avatar')
      .populate('replyTo', 'content author')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'author',
          select: 'username discriminator avatar'
        }
      })
      .populate('reactions.users', 'username discriminator avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Reverse to show oldest first
    messages.reverse();

    res.json({ 
      messages,
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get channel messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private
const editMessage = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  validate,
  async (req, res) => {
    try {
      const { content } = req.body;

      const message = await Message.findById(req.params.id)
        .populate('author', 'username discriminator avatar');

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Check if user is the author
      if (message.author._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own messages' });
      }

      // Check if message was sent within the last 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      if (message.createdAt < fifteenMinutesAgo) {
        return res.status(400).json({ message: 'Cannot edit messages older than 15 minutes' });
      }

      message.content = content;
      message.edited = true;
      message.editedAt = new Date();

      await message.save();

      res.json({
        message: 'Message edited successfully',
        data: message
      });
    } catch (error) {
      console.error('Edit message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const channel = await Channel.findById(message.channel);
    const server = await Server.findById(channel.server);

    // Check if user is the author or has manage_messages permission
    const canDelete = message.author.toString() === req.user.id || 
                     server.hasPermission(req.user.id, 'manage_messages');

    if (!canDelete) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    message.deleted = true;
    message.deletedAt = new Date();
    message.content = '[deleted]';

    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add reaction to message
// @route   POST /api/messages/:id/reactions
// @access  Private
const addReaction = [
  body('emoji')
    .notEmpty()
    .withMessage('Emoji is required'),
  validate,
  async (req, res) => {
    try {
      const { emoji } = req.body;

      const message = await Message.findById(req.params.id);

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      await message.addReaction(emoji, req.user.id);

      res.json({ message: 'Reaction added successfully' });
    } catch (error) {
      console.error('Add reaction error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Remove reaction from message
// @route   DELETE /api/messages/:id/reactions/:emoji
// @access  Private
const removeReaction = async (req, res) => {
  try {
    const { emoji } = req.params;

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(decodeURIComponent(emoji), req.user.id);

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Pin/Unpin a message
// @route   PUT /api/messages/:id/pin
// @access  Private
const togglePin = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const channel = await Channel.findById(message.channel);
    const server = await Server.findById(channel.server);

    // Check permissions
    if (!server.hasPermission(req.user.id, 'manage_messages')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    message.pinned = !message.pinned;
    await message.save();

    res.json({
      message: `Message ${message.pinned ? 'pinned' : 'unpinned'} successfully`,
      pinned: message.pinned
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pinned messages in channel
// @route   GET /api/messages/channel/:channelId/pinned
// @access  Private
const getPinnedMessages = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const server = await Server.findById(channel.server);

    // Check if user is a member
    const isMember = server.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pinnedMessages = await Message.find({
      channel: channelId,
      pinned: true,
      deleted: false
    })
    .populate('author', 'username discriminator avatar')
    .sort({ createdAt: -1 });

    res.json({ messages: pinnedMessages });
  } catch (error) {
    console.error('Get pinned messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search messages
// @route   GET /api/messages/search
// @access  Private
const searchMessages = async (req, res) => {
  try {
    const { query, channelId, serverId, authorId, limit = 25 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchFilter = {
      content: { $regex: query, $options: 'i' },
      deleted: false
    };

    if (channelId) {
      searchFilter.channel = channelId;
    } else if (serverId) {
      searchFilter.server = serverId;
    }

    if (authorId) {
      searchFilter.author = authorId;
    }

    const messages = await Message.find(searchFilter)
      .populate('author', 'username discriminator avatar')
      .populate('channel', 'name type')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ messages });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  sendMessageWithFile,
  getChannelMessages,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  togglePin,
  getPinnedMessages,
  searchMessages
};