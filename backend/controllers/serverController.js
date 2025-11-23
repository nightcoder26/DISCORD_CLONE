const { body } = require('express-validator');
const Server = require('../models/Server');
const Channel = require('../models/Channel');
const User = require('../models/User');
const validate = require('../middleware/validation');

// Validation rules
const createServerValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Server name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// @desc    Create a new server
// @route   POST /api/servers
// @access  Private
const createServer = [
  ...createServerValidation,
  validate,
  async (req, res) => {
    try {
      const { name, description, icon } = req.body;

      const server = new Server({
        name,
        description,
        icon,
        owner: req.user.id,
        members: [{
          user: req.user.id,
          role: 'owner'
        }]
      });

      await server.save();

      // Create default channels
      const generalChannel = new Channel({
        name: 'general',
        type: 'text',
        server: server._id,
        category: 'Text Channels'
      });

      const voiceChannel = new Channel({
        name: 'General',
        type: 'voice',
        server: server._id,
        category: 'Voice Channels'
      });

      await Promise.all([generalChannel.save(), voiceChannel.save()]);

      server.channels.push(generalChannel._id, voiceChannel._id);
      server.categories = [
        {
          name: 'Text Channels',
          channels: [generalChannel._id],
          position: 0
        },
        {
          name: 'Voice Channels',
          channels: [voiceChannel._id],
          position: 1
        }
      ];

      await server.save();

      // Add server to user's servers list
      await User.findByIdAndUpdate(req.user.id, {
        $push: { servers: server._id }
      });

      const populatedServer = await Server.findById(server._id)
        .populate('channels')
        .populate('members.user', 'username discriminator avatar status');

      res.status(201).json({
        message: 'Server created successfully',
        server: populatedServer
      });
    } catch (error) {
      console.error('Create server error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Get user's servers
// @route   GET /api/servers
// @access  Private
const getUserServers = async (req, res) => {
  try {
    const servers = await Server.find({
      'members.user': req.user.id
    })
    .populate('channels')
    .populate('owner', 'username discriminator avatar')
    .sort({ createdAt: -1 });

    res.json({ servers });
  } catch (error) {
    console.error('Get user servers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get server by ID
// @route   GET /api/servers/:id
// @access  Private
const getServerById = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('channels')
      .populate('members.user', 'username discriminator avatar status isOnline lastSeen')
      .populate('owner', 'username discriminator avatar');

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check if user is a member
    const isMember = server.members.some(member => 
      member.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ server });
  } catch (error) {
    console.error('Get server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update server
// @route   PUT /api/servers/:id
// @access  Private
const updateServer = [
  ...createServerValidation,
  validate,
  async (req, res) => {
    try {
      const { name, description, icon, banner } = req.body;

      const server = await Server.findById(req.params.id);

      if (!server) {
        return res.status(404).json({ message: 'Server not found' });
      }

      // Check permissions
      if (!server.hasPermission(req.user.id, 'manage_server')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      server.name = name || server.name;
      server.description = description || server.description;
      server.icon = icon || server.icon;
      server.banner = banner || server.banner;

      await server.save();

      const updatedServer = await Server.findById(server._id)
        .populate('channels')
        .populate('members.user', 'username discriminator avatar status');

      res.json({
        message: 'Server updated successfully',
        server: updatedServer
      });
    } catch (error) {
      console.error('Update server error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// @desc    Delete server
// @route   DELETE /api/servers/:id
// @access  Private
const deleteServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Only owner can delete server
    if (server.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only server owner can delete the server' });
    }

    // Delete all channels
    await Channel.deleteMany({ server: server._id });

    // Remove server from all members' servers list
    await User.updateMany(
      { servers: server._id },
      { $pull: { servers: server._id } }
    );

    await Server.findByIdAndDelete(server._id);

    res.json({ message: 'Server deleted successfully' });
  } catch (error) {
    console.error('Delete server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join server by invite code
// @route   POST /api/servers/join/:inviteCode
// @access  Private
const joinServer = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const server = await Server.findOne({ inviteCode })
      .populate('channels')
      .populate('members.user', 'username discriminator avatar');

    if (!server) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if user is already a member
    const isMember = server.members.some(member => 
      member.user._id.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this server' });
    }

    // Check if server is full
    if (server.members.length >= server.maxMembers) {
      return res.status(400).json({ message: 'Server is full' });
    }

    // Add user to server
    await server.addMember(req.user.id, server.defaultRole);

    // Add server to user's servers list
    await User.findByIdAndUpdate(req.user.id, {
      $push: { servers: server._id }
    });

    const updatedServer = await Server.findById(server._id)
      .populate('channels')
      .populate('members.user', 'username discriminator avatar status');

    res.json({
      message: 'Successfully joined server',
      server: updatedServer
    });
  } catch (error) {
    console.error('Join server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Leave server
// @route   POST /api/servers/:id/leave
// @access  Private
const leaveServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Owner cannot leave their own server
    if (server.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'Server owner cannot leave the server' });
    }

    // Remove user from server
    await server.removeMember(req.user.id);

    // Remove server from user's servers list
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { servers: server._id }
    });

    res.json({ message: 'Successfully left server' });
  } catch (error) {
    console.error('Leave server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Kick member from server
// @route   DELETE /api/servers/:id/members/:userId
// @access  Private
const kickMember = async (req, res) => {
  try {
    const { id: serverId, userId } = req.params;

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check permissions
    if (!server.hasPermission(req.user.id, 'kick')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Cannot kick owner
    if (server.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot kick server owner' });
    }

    // Remove user from server
    await server.removeMember(userId);

    // Remove server from user's servers list
    await User.findByIdAndUpdate(userId, {
      $pull: { servers: serverId }
    });

    res.json({ message: 'Member kicked successfully' });
  } catch (error) {
    console.error('Kick member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update member role
// @route   PUT /api/servers/:id/members/:userId/role
// @access  Private
const updateMemberRole = async (req, res) => {
  try {
    const { id: serverId, userId } = req.params;
    const { role } = req.body;

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check permissions
    if (!server.hasPermission(req.user.id, 'manage_members')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Cannot change owner role
    if (server.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot change owner role' });
    }

    const member = server.members.find(m => m.user.toString() === userId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;
    await server.save();

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get server members
// @route   GET /api/servers/:id/members
// @access  Private
const getServerMembers = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('members.user', 'username discriminator avatar status isOnline lastSeen');

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check if user is a member
    const isMember = server.members.some(member => 
      member.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ members: server.members });
  } catch (error) {
    console.error('Get server members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};