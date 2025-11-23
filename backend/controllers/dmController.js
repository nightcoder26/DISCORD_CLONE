const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');
const { body } = require('express-validator');
const validate = require('../middleware/validation');

// Validation rules
const sendMessageValidation = [
  body('recipientId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid recipient ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters')
];

const editMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters')
];

// @desc    Get direct messages between users
// @route   GET /api/dm/:userId
// @access  Private
const getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, before } = req.query;
    
    // Verify the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let query = {
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    };
    
    // Pagination support
    if (before) {
      query.createdAt = { $lt: before };
    }
    
    const messages = await DirectMessage.find(query)
      .populate('sender', 'username avatar')
      .populate('recipient', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Reverse to get chronological order
    messages.reverse();
    
    res.json(messages);
  } catch (error) {
    console.error('Get direct messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send direct message
// @route   POST /api/dm
// @access  Private
const sendDirectMessage = [
  ...sendMessageValidation,
  validate,
  async (req, res) => {
    try {
      const { recipientId, content } = req.body;
      
      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
      
      // Prevent sending message to yourself
      if (recipientId === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot send message to yourself' });
      }
      
      const message = new DirectMessage({
        sender: req.user._id,
        recipient: recipientId,
        content: content.trim()
      });
      
      await message.save();
      
      // Populate sender and recipient info
      await message.populate('sender', 'username avatar');
      await message.populate('recipient', 'username avatar');
      
      // Emit to both users via socket
      req.io.to(`user:${req.user._id}`).emit('newDirectMessage', message);
      req.io.to(`user:${recipientId}`).emit('newDirectMessage', message);
      
      res.status(201).json({
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      console.error('Send direct message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Edit direct message
// @route   PUT /api/dm/:messageId
// @access  Private
const editDirectMessage = [
  ...editMessageValidation,
  validate,
  async (req, res) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      
      const message = await DirectMessage.findById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Check if user is the sender
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this message' });
      }
      
      // Check if message is not too old (e.g., 24 hours)
      const hoursSinceCreated = (new Date() - message.createdAt) / (1000 * 60 * 60);
      if (hoursSinceCreated > 24) {
        return res.status(400).json({ message: 'Cannot edit messages older than 24 hours' });
      }
      
      message.content = content.trim();
      message.edited = true;
      message.editedAt = new Date();
      
      await message.save();
      await message.populate('sender', 'username avatar');
      await message.populate('recipient', 'username avatar');
      
      // Emit to both users via socket
      req.io.to(`user:${message.sender._id}`).emit('messageEdited', message);
      req.io.to(`user:${message.recipient._id}`).emit('messageEdited', message);
      
      res.json({
        message: 'Message edited successfully',
        data: message
      });
    } catch (error) {
      console.error('Edit direct message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Delete direct message
// @route   DELETE /api/dm/:messageId
// @access  Private
const deleteDirectMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await DirectMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await DirectMessage.findByIdAndDelete(messageId);
    
    // Emit to both users via socket
    req.io.to(`user:${message.sender}`).emit('messageDeleted', { messageId });
    req.io.to(`user:${message.recipient}`).emit('messageDeleted', { messageId });
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete direct message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add reaction to direct message
// @route   POST /api/dm/:messageId/reactions
// @access  Private
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }
    
    const message = await DirectMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is part of this conversation
    const isParticipant = message.sender.toString() === req.user._id.toString() || 
                         message.recipient.toString() === req.user._id.toString();
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to react to this message' });
    }
    
    // Check if reaction already exists
    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    
    if (existingReaction) {
      // Check if user already reacted with this emoji
      if (existingReaction.users.includes(req.user._id)) {
        return res.status(400).json({ message: 'Already reacted with this emoji' });
      }
      
      // Add user to existing reaction
      existingReaction.users.push(req.user._id);
      existingReaction.count = existingReaction.users.length;
    } else {
      // Create new reaction
      message.reactions.push({
        emoji,
        users: [req.user._id],
        count: 1
      });
    }
    
    await message.save();
    await message.populate('sender', 'username avatar');
    await message.populate('recipient', 'username avatar');
    
    // Emit to both users via socket
    req.io.to(`user:${message.sender._id}`).emit('messageReactionAdded', {
      messageId,
      emoji,
      userId: req.user._id,
      message
    });
    req.io.to(`user:${message.recipient._id}`).emit('messageReactionAdded', {
      messageId,
      emoji,
      userId: req.user._id,
      message
    });
    
    res.json({
      message: 'Reaction added successfully',
      data: message
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove reaction from direct message
// @route   DELETE /api/dm/:messageId/reactions
// @access  Private
const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }
    
    const message = await DirectMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is part of this conversation
    const isParticipant = message.sender.toString() === req.user._id.toString() || 
                         message.recipient.toString() === req.user._id.toString();
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to react to this message' });
    }
    
    // Find the reaction
    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    
    if (reactionIndex === -1) {
      return res.status(404).json({ message: 'Reaction not found' });
    }
    
    const reaction = message.reactions[reactionIndex];
    
    // Check if user has reacted with this emoji
    const userIndex = reaction.users.indexOf(req.user._id);
    if (userIndex === -1) {
      return res.status(400).json({ message: 'You have not reacted with this emoji' });
    }
    
    // Remove user from reaction
    reaction.users.splice(userIndex, 1);
    reaction.count = reaction.users.length;
    
    // Remove reaction if no users left
    if (reaction.count === 0) {
      message.reactions.splice(reactionIndex, 1);
    }
    
    await message.save();
    await message.populate('sender', 'username avatar');
    await message.populate('recipient', 'username avatar');
    
    // Emit to both users via socket
    req.io.to(`user:${message.sender._id}`).emit('messageReactionRemoved', {
      messageId,
      emoji,
      userId: req.user._id,
      message
    });
    req.io.to(`user:${message.recipient._id}`).emit('messageReactionRemoved', {
      messageId,
      emoji,
      userId: req.user._id,
      message
    });
    
    res.json({
      message: 'Reaction removed successfully',
      data: message
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's direct message conversations
// @route   GET /api/dm/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    // Get latest message from each conversation
    const conversations = await DirectMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $last: '$$ROOT' },
          lastMessageDate: { $max: '$createdAt' }
        }
      },
      {
        $sort: { lastMessageDate: -1 }
      }
    ]);
    
    // Populate user info for each conversation
    await DirectMessage.populate(conversations, [
      { path: '_id', select: 'username avatar status lastSeen' },
      { path: 'lastMessage.sender', select: 'username avatar' },
      { path: 'lastMessage.recipient', select: 'username avatar' }
    ]);
    
    const formattedConversations = conversations.map(conv => ({
      user: conv._id,
      lastMessage: conv.lastMessage,
      lastMessageDate: conv.lastMessageDate
    }));
    
    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDirectMessages,
  sendDirectMessage,
  editDirectMessage,
  deleteDirectMessage,
  addReaction,
  removeReaction,
  getConversations
};