const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DirectMessageContent'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DirectMessageContent'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    maxlength: 100
  },
  groupIcon: {
    type: String
  },
  // For group DMs
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const directMessageContentSchema = new mongoose.Schema({
  content: {
    type: String,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DirectMessage',
    required: true
  },
  type: {
    type: String,
    enum: ['default', 'system', 'reply', 'edit'],
    default: 'default'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DirectMessageContent'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    contentType: String
  }],
  reactions: [{
    emoji: String,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    count: {
      type: Number,
      default: 0
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
directMessageSchema.index({ participants: 1, lastActivity: -1 });
directMessageContentSchema.index({ conversation: 1, createdAt: -1 });
directMessageContentSchema.index({ author: 1 });

// Find or create DM conversation
directMessageSchema.statics.findOrCreateConversation = async function(participants) {
  // Sort participants to ensure consistent order
  const sortedParticipants = participants.sort();
  
  let conversation = await this.findOne({
    participants: { $all: sortedParticipants, $size: sortedParticipants.length },
    isGroup: false
  });
  
  if (!conversation) {
    conversation = await this.create({
      participants: sortedParticipants,
      isGroup: sortedParticipants.length > 2
    });
  }
  
  return conversation;
};

// Mark messages as read
directMessageContentSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => 
    read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Add reaction method
directMessageContentSchema.methods.addReaction = function(emoji, userId) {
  let reaction = this.reactions.find(r => r.emoji === emoji);
  
  if (!reaction) {
    reaction = { emoji, users: [], count: 0 };
    this.reactions.push(reaction);
  }
  
  if (!reaction.users.includes(userId)) {
    reaction.users.push(userId);
    reaction.count = reaction.users.length;
  }
  
  return this.save();
};

// Remove reaction method
directMessageContentSchema.methods.removeReaction = function(emoji, userId) {
  const reaction = this.reactions.find(r => r.emoji === emoji);
  
  if (reaction) {
    reaction.users = reaction.users.filter(id => id.toString() !== userId.toString());
    reaction.count = reaction.users.length;
    
    if (reaction.count === 0) {
      this.reactions = this.reactions.filter(r => r.emoji !== emoji);
    }
  }
  
  return this.save();
};

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
const DirectMessageContent = mongoose.model('DirectMessageContent', directMessageContentSchema);

module.exports = { DirectMessage, DirectMessageContent };