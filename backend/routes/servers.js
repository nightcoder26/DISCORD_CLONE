const express = require('express');
const {
  createServer,
  getUserServers,
  getServerById,
  updateServer,
  deleteServer,
  joinServer,
  leaveServer,
  kickMember,
  updateMemberRole,
  getServerMembers
} = require('../controllers/serverController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/servers
// @desc    Create a new server
// @access  Private
router.post('/', createServer);

// @route   GET /api/servers
// @desc    Get user's servers
// @access  Private
router.get('/', getUserServers);

// @route   GET /api/servers/:id
// @desc    Get server by ID
// @access  Private
router.get('/:id', getServerById);

// @route   PUT /api/servers/:id
// @desc    Update server
// @access  Private
router.put('/:id', updateServer);

// @route   DELETE /api/servers/:id
// @desc    Delete server
// @access  Private
router.delete('/:id', deleteServer);

// @route   POST /api/servers/join/:inviteCode
// @desc    Join server by invite code
// @access  Private
router.post('/join/:inviteCode', joinServer);

// @route   POST /api/servers/:id/leave
// @desc    Leave server
// @access  Private
router.post('/:id/leave', leaveServer);

// @route   GET /api/servers/:id/members
// @desc    Get server members
// @access  Private
router.get('/:id/members', getServerMembers);

// @route   DELETE /api/servers/:id/members/:userId
// @desc    Kick member from server
// @access  Private
router.delete('/:id/members/:userId', kickMember);

// @route   PUT /api/servers/:id/members/:userId/role
// @desc    Update member role
// @access  Private
router.put('/:id/members/:userId/role', updateMemberRole);

module.exports = router;