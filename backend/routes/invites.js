const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createInvite,
  getInvite,
  useInvite,
  getServerInvites,
  deleteInvite
} = require('../controllers/inviteController');

// @route   POST /api/invites
// @desc    Create server invite
// @access  Private
router.post('/', authenticate, createInvite);

// @route   GET /api/invites/:code
// @desc    Get invite by code (public for preview)
// @access  Public
router.get('/:code', getInvite);

// @route   POST /api/invites/:code/join
// @desc    Join server using invite
// @access  Private
router.post('/:code/join', authenticate, useInvite);

// @route   GET /api/invites/server/:serverId
// @desc    Get all invites for a server
// @access  Private
router.get('/server/:serverId', authenticate, getServerInvites);

// @route   DELETE /api/invites/:code
// @desc    Delete invite
// @access  Private
router.delete('/:code', authenticate, deleteInvite);

module.exports = router;