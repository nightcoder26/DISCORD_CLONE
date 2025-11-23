const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateProfile,
  updateStatus,
  searchUsers,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', getAllUsers);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', searchUsers);

// @route   GET /api/users/friends
// @desc    Get user's friends
// @access  Private
router.get('/friends', getFriends);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfile);

// @route   PUT /api/users/status
// @desc    Update user status
// @access  Private
router.put('/status', updateStatus);

// @route   POST /api/users/friends/request/:userId
// @desc    Send friend request
// @access  Private
router.post('/friends/request/:userId', sendFriendRequest);

// @route   PUT /api/users/friends/accept/:userId
// @desc    Accept friend request
// @access  Private
router.put('/friends/accept/:userId', acceptFriendRequest);

// @route   DELETE /api/users/friends/reject/:userId
// @desc    Reject friend request
// @access  Private
router.delete('/friends/reject/:userId', rejectFriendRequest);

// @route   DELETE /api/users/friends/:userId
// @desc    Remove friend
// @access  Private
router.delete('/friends/:userId', removeFriend);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', getUserById);

module.exports = router;