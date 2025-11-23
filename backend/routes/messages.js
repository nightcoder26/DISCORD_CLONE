const express = require('express');
const {
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
} = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', sendMessage);

// @route   POST /api/messages/upload
// @desc    Send a message with file attachment
// @access  Private
router.post('/upload', sendMessageWithFile);

// @route   GET /api/messages/channel/:channelId
// @desc    Get channel messages
// @access  Private
router.get('/channel/:channelId', getChannelMessages);

// @route   GET /api/messages/channel/:channelId/pinned
// @desc    Get pinned messages in channel
// @access  Private
router.get('/channel/:channelId/pinned', getPinnedMessages);

// @route   GET /api/messages/search
// @desc    Search messages
// @access  Private
router.get('/search', searchMessages);

// @route   PUT /api/messages/:id
// @desc    Edit a message
// @access  Private
router.put('/:id', editMessage);

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', deleteMessage);

// @route   POST /api/messages/:id/reactions
// @desc    Add reaction to message
// @access  Private
router.post('/:id/reactions', addReaction);

// @route   DELETE /api/messages/:id/reactions/:emoji
// @desc    Remove reaction from message
// @access  Private
router.delete('/:id/reactions/:emoji', removeReaction);

// @route   PUT /api/messages/:id/pin
// @desc    Pin/Unpin a message
// @access  Private
router.put('/:id/pin', togglePin);

module.exports = router;