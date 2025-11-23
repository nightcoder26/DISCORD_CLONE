const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validation');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = [
  ...registerValidation,
  validate,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists by email
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }

      // Generate a unique discriminator
      let discriminator;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        discriminator = Math.floor(1000 + Math.random() * 9000).toString();
        const existingDiscriminator = await User.findOne({ username, discriminator });
        if (!existingDiscriminator) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        return res.status(400).json({
          message: 'Unable to generate unique discriminator. Please try a different username.'
        });
      }

      // Create user
      const user = new User({
        username,
        email,
        password,
        discriminator
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          discriminator: user.discriminator,
          avatar: user.avatar,
          fullUsername: user.fullUsername
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
];

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = [
  ...loginValidation,
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Update online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          discriminator: user.discriminator,
          avatar: user.avatar,
          fullUsername: user.fullUsername,
          status: user.status,
          customStatus: user.customStatus
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
];

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('servers', 'name icon')
      .populate('friends.user', 'username discriminator avatar status');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        discriminator: user.discriminator,
        avatar: user.avatar,
        fullUsername: user.fullUsername,
        status: user.status,
        customStatus: user.customStatus,
        servers: user.servers,
        friends: user.friends
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Update user offline status
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastSeen: new Date()
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
const googleAuth = (req, res, next) => {
  // This will be handled by passport middleware
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    // Update online status
    req.user.isOnline = true;
    req.user.lastSeen = new Date();
    await req.user.save();

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = async (req, res) => {
  try {
    const newToken = generateToken(req.user.id);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  googleAuth,
  googleCallback,
  refreshToken
};