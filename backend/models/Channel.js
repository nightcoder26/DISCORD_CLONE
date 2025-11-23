const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['text', 'voice'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1024
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  category: {
    type: String,
    maxlength: 50
  },
  position: {
    type: Number,
    default: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowedRoles: [{
    type: String,
    enum: ['owner', 'co-owner', 'admin', 'mod', 'neta-ji', 'member']
  }],
  slowMode: {
    type: Number, // seconds
    default: 0,
    min: 0,
    max: 21600 // 6 hours
  },
  topic: {
    type: String,
    maxlength: 1024
  },
  nsfw: {
    type: Boolean,
    default: false
  },
  // Voice channel specific
  userLimit: {
    type: Number,
    default: 0, // 0 means unlimited
    min: 0,
    max: 99
  },
  bitrate: {
    type: Number,
    default: 64000, // 64kbps
    min: 8000,
    max: 384000
  },
  // Current voice channel users
  connectedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    muted: {
      type: Boolean,
      default: false
    },
    deafened: {
      type: Boolean,
      default: false
    },
    speaking: {
      type: Boolean,
      default: false
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add user to voice channel
channelSchema.methods.addUser = function(userId) {
  if (this.type !== 'voice') return;
  
  const existingUser = this.connectedUsers.find(user => 
    user.user.toString() === userId.toString()
  );
  
  if (!existingUser) {
    this.connectedUsers.push({ user: userId });
  }
  
  return this.save();
};

// Remove user from voice channel
channelSchema.methods.removeUser = function(userId) {
  if (this.type !== 'voice') return;
  
  this.connectedUsers = this.connectedUsers.filter(user => 
    user.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Check if channel is full
channelSchema.methods.isFull = function() {
  if (this.type !== 'voice' || this.userLimit === 0) return false;
  return this.connectedUsers.length >= this.userLimit;
};

// Update user voice state
channelSchema.methods.updateUserState = function(userId, state) {
  if (this.type !== 'voice') return;
  
  const user = this.connectedUsers.find(user => 
    user.user.toString() === userId.toString()
  );
  
  if (user) {
    Object.assign(user, state);
    return this.save();
  }
};

module.exports = mongoose.model('Channel', channelSchema);