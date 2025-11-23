const { body } = require('express-validator');
const Invite = require('../models/Invite');
const Server = require('../models/Server');
const User = require('../models/User');
const validate = require('../middleware/validation');

// Validation rules
const createInviteValidation = [
  body('maxUses')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Max uses must be between 0 and 1000'),
  body('maxAge')
    .optional()
    .isInt({ min: 0, max: 604800 }) // Max 7 days in seconds
    .withMessage('Max age must be between 0 and 604800 seconds (7 days)'),
  body('temporary')
    .optional()
    .isBoolean()
    .withMessage('Temporary must be a boolean')
];

// @desc    Create server invite
// @route   POST /api/invites
// @access  Private
const createInvite = [
  ...createInviteValidation,
  validate,
  async (req, res) => {
    try {
      const { serverId, channelId, maxUses = 0, maxAge = 0, temporary = false } = req.body;

      const server = await Server.findById(serverId);
      if (!server) {
        return res.status(404).json({ message: 'Server not found' });
      }

      // Check if user has permission to create invites
      if (!server.hasPermission(req.user.id, 'create_instant_invite')) {
        return res.status(403).json({ message: 'Insufficient permissions to create invites' });
      }

      // Calculate expiration date
      let expiresAt = null;
      if (maxAge > 0) {
        expiresAt = new Date(Date.now() + (maxAge * 1000));
      }

      const invite = new Invite({
        server: serverId,
        inviter: req.user.id,
        channel: channelId || null,
        maxUses,
        expiresAt,
        temporary
      });

      await invite.save();

      // Populate the invite with server and inviter info
      const populatedInvite = await Invite.findById(invite._id)
        .populate('server', 'name icon')
        .populate('inviter', 'username discriminator avatar')
        .populate('channel', 'name type');

      res.status(201).json({
        message: 'Invite created successfully',
        invite: populatedInvite
      });
    } catch (error) {
      console.error('Create invite error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Get invite by code
// @route   GET /api/invites/:code
// @access  Public
const getInvite = async (req, res) => {
  try {
    const { code } = req.params;

    const invite = await Invite.findOne({ code })
      .populate('server', 'name icon memberCount')
      .populate('inviter', 'username discriminator avatar')
      .populate('channel', 'name type');

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    if (!invite.isValid()) {
      return res.status(410).json({ message: 'Invite has expired or is no longer valid' });
    }

    // Don't expose sensitive information
    const safeInvite = {
      code: invite.code,
      server: invite.server,
      inviter: invite.inviter,
      channel: invite.channel,
      memberCount: invite.server.memberCount || 0
    };

    res.json(safeInvite);
  } catch (error) {
    console.error('Get invite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Use invite (join server)
// @route   POST /api/invites/:code/join
// @access  Private
const useInvite = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user.id;

    const invite = await Invite.findOne({ code })
      .populate('server');

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    if (!invite.isValid()) {
      return res.status(410).json({ message: 'Invite has expired or is no longer valid' });
    }

    const server = invite.server;

    // Check if user is already a member
    const isMember = server.members.some(member => 
      member.user.toString() === userId.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this server' });
    }

    // Add user to server
    server.members.push({
      user: userId,
      joinedAt: new Date(),
      roles: ['member']
    });

    await server.save();

    // Use the invite (increment counter)
    await invite.use();

    // Add server to user's servers
    const user = await User.findById(userId);
    if (!user.servers.includes(server._id)) {
      user.servers.push(server._id);
      await user.save();
    }

    // Emit server joined event
    if (req.io) {
      // Notify all server members about new member
      server.members.forEach(member => {
        req.io.to(`user:${member.user}`).emit('memberJoined', {
          serverId: server._id,
          member: {
            user: userId,
            username: req.user.username,
            discriminator: req.user.discriminator,
            avatar: req.user.avatar
          }
        });
      });

      // Notify the new member about joining
      req.io.to(`user:${userId}`).emit('serverJoined', {
        server: server
      });
    }

    res.json({
      message: 'Successfully joined server',
      server: {
        _id: server._id,
        name: server.name,
        icon: server.icon
      }
    });
  } catch (error) {
    console.error('Use invite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get server invites
// @route   GET /api/invites/server/:serverId
// @access  Private
const getServerInvites = async (req, res) => {
  try {
    const { serverId } = req.params;

    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check permissions
    if (!server.hasPermission(req.user.id, 'manage_server')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const invites = await Invite.find({ server: serverId, isActive: true })
      .populate('inviter', 'username discriminator avatar')
      .populate('channel', 'name type')
      .sort({ createdAt: -1 });

    res.json(invites);
  } catch (error) {
    console.error('Get server invites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete invite
// @route   DELETE /api/invites/:code
// @access  Private
const deleteInvite = async (req, res) => {
  try {
    const { code } = req.params;

    const invite = await Invite.findOne({ code });
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    const server = await Server.findById(invite.server);
    
    // Check permissions (must be inviter or have manage server permission)
    const isInviter = invite.inviter.toString() === req.user.id;
    const hasPermission = server.hasPermission(req.user.id, 'manage_server');

    if (!isInviter && !hasPermission) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await Invite.findByIdAndDelete(invite._id);

    res.json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Delete invite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createInvite,
  getInvite,
  useInvite,
  getServerInvites,
  deleteInvite
};