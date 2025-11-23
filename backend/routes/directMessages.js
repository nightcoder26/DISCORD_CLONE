const express = require('express');
const {
  getDirectMessages,
  sendDirectMessage,
  editDirectMessage,
  deleteDirectMessage,
  addReaction,
  removeReaction,
  getConversations
} = require('../controllers/dmController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/dm/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', getConversations);

// @route   GET /api/dm/:userId
// @desc    Get direct messages with a user
// @access  Private
router.get('/:userId', getDirectMessages);

// @route   POST /api/dm
// @desc    Send direct message
// @access  Private
router.post('/', sendDirectMessage);

// @route   PUT /api/dm/:messageId
// @desc    Edit direct message
// @access  Private
router.put('/:messageId', editDirectMessage);

// @route   DELETE /api/dm/:messageId
// @desc    Delete direct message
// @access  Private
router.delete('/:messageId', deleteDirectMessage);

// @route   POST /api/dm/:messageId/reactions
// @desc    Add reaction to message
// @access  Private
router.post('/:messageId/reactions', addReaction);

// @route   DELETE /api/dm/:messageId/reactions
// @desc    Remove reaction from message
// @access  Private
router.delete('/:messageId/reactions', removeReaction);

module.exports = router;