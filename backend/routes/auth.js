const express = require('express');
const passport = require('passport');
const {
  register,
  login,
  getMe,
  logout,
  googleAuth,
  googleCallback,
  refreshToken
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, logout);

// @route   POST /api/auth/refresh
// @desc    Refresh token
// @access  Private
router.post('/refresh', authenticate, refreshToken);

// Google OAuth routes
// @route   GET /api/auth/google
// @desc    Google OAuth
// @access  Public
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/auth/error`,
    session: false
  }),
  googleCallback
);

module.exports = router;