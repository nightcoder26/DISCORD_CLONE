const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  icon: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'co-owner', 'admin', 'mod', 'neta-ji', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    nickname: {
      type: String,
      maxlength: 32
    }
  }],
  channels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }],
  categories: [{
    name: {
      type: String,
      required: true,
      maxlength: 50
    },
    channels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel'
    }],
    position: {
      type: Number,
      default: 0
    }
  }],
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 100000
  },
  verificationLevel: {
    type: String,
    enum: ['none', 'low', 'medium', 'high', 'very-high'],
    default: 'none'
  },
  defaultRole: {
    type: String,
    enum: ['member', 'neta-ji'],
    default: 'member'
  }
}, {
  timestamps: true
});

// Generate invite code before saving
serverSchema.pre('save', function(next) {
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Add member method
serverSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({
      user: userId,
      role: role
    });
  }
  
  return this.save();
};

// Remove member method
serverSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Get member role
serverSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// Check if user has permission
serverSchema.methods.hasPermission = function(userId, action) {
  const role = this.getMemberRole(userId);
  if (!role) return false;
  
  const permissions = {
    'owner': ['all'],
    'co-owner': ['manage_server', 'manage_channels', 'manage_members', 'kick', 'ban'],
    'admin': ['manage_channels', 'manage_members', 'kick', 'ban'],
    'mod': ['manage_messages', 'kick'],
    'neta-ji': ['send_messages', 'manage_messages'],
    'member': ['send_messages']
  };
  
  const userPermissions = permissions[role] || [];
  return userPermissions.includes('all') || userPermissions.includes(action);
};

module.exports = mongoose.model('Server', serverSchema);