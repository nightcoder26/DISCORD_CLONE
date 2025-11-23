const User = require('../models/User');
const { body } = require('express-validator');
const validate = require('../middleware/validation');

// Validation rules
const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('status')
    .optional()
    .isIn(['online', 'away', 'dnd', 'invisible'])
    .withMessage('Invalid status value')
];

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const { search, limit = 20, skip = 0 } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ username: 1 });
    
    res.json({
      users,
      total: await User.countDocuments(query)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = [
  ...updateProfileValidation,
  validate,
  async (req, res) => {
    try {
      const { username, email, status, avatar } = req.body;
      
      // Check if username is taken by another user
      if (username && username !== req.user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }
      
      // Check if email is taken by another user
      if (email && email !== req.user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email is already taken' });
        }
      }
      
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (status) updateData.status = status;
      if (avatar) updateData.avatar = avatar;
      
      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ 
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken` 
        });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Update user status
// @route   PUT /api/users/status
// @access  Private
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['online', 'away', 'dnd', 'invisible'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status, lastSeen: new Date() },
      { new: true }
    ).select('-password');
    
    // Emit status update to all connected sockets
    req.io.emit('userStatusUpdate', {
      userId: user._id,
      status: user.status,
      lastSeen: user.lastSeen
    });
    
    res.json({
      message: 'Status updated successfully',
      status: user.status
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: q.trim(), $options: 'i' } },
            { email: { $regex: q.trim(), $options: 'i' } }
          ]
        }
      ]
    })
    .select('username email avatar status lastSeen')
    .limit(parseInt(limit))
    .sort({ username: 1 });
    
    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's friends
// @route   GET /api/users/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username email avatar status lastSeen')
      .select('friends');
    
    res.json(user.friends || []);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send friend request
// @route   POST /api/users/friends/request/:userId
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already friends
    if (req.user.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }
    
    // Check if request already sent
    if (req.user.friendRequestsSent.includes(userId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }
    
    // Check if request already received
    if (req.user.friendRequestsReceived.includes(userId)) {
      return res.status(400).json({ message: 'This user has already sent you a friend request' });
    }
    
    // Add to friend requests
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friendRequestsSent: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friendRequestsReceived: req.user._id }
    });
    
    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept friend request
// @route   PUT /api/users/friends/accept/:userId
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if friend request exists
    if (!req.user.friendRequestsReceived.includes(userId)) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }
    
    // Add to friends and remove from requests
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friends: userId },
      $pull: { friendRequestsReceived: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: req.user._id },
      $pull: { friendRequestsSent: req.user._id }
    });
    
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject friend request
// @route   DELETE /api/users/friends/reject/:userId
// @access  Private
const rejectFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Remove from friend requests
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friendRequestsReceived: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $pull: { friendRequestsSent: req.user._id }
    });
    
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove friend
// @route   DELETE /api/users/friends/:userId
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Remove from friends
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: req.user._id }
    });
    
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};