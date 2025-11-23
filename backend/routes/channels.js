const express = require('express');
const {
  createChannel,
  getChannelById,
  updateChannel,
  deleteChannel,
  getServerChannels,
  joinVoiceChannel,
  leaveVoiceChannel,
  getVoiceChannelUsers
} = require('../controllers/channelController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/channels
// @desc    Create a new channel
// @access  Private
router.post('/', createChannel);

// @route   GET /api/channels/:id
// @desc    Get channel by ID
// @access  Private
router.get('/:id', getChannelById);

// @route   PUT /api/channels/:id
// @desc    Update channel
// @access  Private
router.put('/:id', updateChannel);

// @route   DELETE /api/channels/:id
// @desc    Delete channel
// @access  Private
router.delete('/:id', deleteChannel);

// @route   GET /api/channels/server/:serverId
// @desc    Get server channels
// @access  Private
router.get('/server/:serverId', getServerChannels);

// Voice channel routes
// @route   POST /api/channels/:id/join-voice
// @desc    Join voice channel
// @access  Private
router.post('/:id/join-voice', joinVoiceChannel);

// @route   POST /api/channels/:id/leave-voice
// @desc    Leave voice channel
// @access  Private
router.post('/:id/leave-voice', leaveVoiceChannel);

// @route   GET /api/channels/:id/voice-users
// @desc    Get voice channel users
// @access  Private
router.get('/:id/voice-users', getVoiceChannelUsers);

module.exports = router;