const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server'
  },
  type: {
    type: String,
    enum: ['default', 'system', 'reply', 'edit'],
    default: 'default'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    contentType: String
  }],
  embeds: [{
    title: String,
    description: String,
    url: String,
    color: String,
    thumbnail: {
      url: String
    },
    image: {
      url: String
    },
    author: {
      name: String,
      iconUrl: String,
      url: String
    },
    fields: [{
      name: String,
      value: String,
      inline: Boolean
    }],
    footer: {
      text: String,
      iconUrl: String
    }
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
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mentionRoles: [{
    type: String
  }],
  mentionEveryone: {
    type: Boolean,
    default: false
  },
  pinned: {
    type: Boolean,
    default: false
  },
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
messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ author: 1 });
messageSchema.index({ server: 1, createdAt: -1 });

// Add reaction method
messageSchema.methods.addReaction = function(emoji, userId) {
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
messageSchema.methods.removeReaction = function(emoji, userId) {
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

// Parse mentions from content
messageSchema.pre('save', function(next) {
  if (!this.isModified('content') || !this.content) return next();
  
  // Extract user mentions (@username#1234 or <@userId>)
  const userMentions = this.content.match(/<@!?(\w+)>/g);
  if (userMentions) {
    this.mentions = userMentions.map(mention => {
      const userId = mention.match(/\w+/)[0];
      return userId;
    }).filter(id => mongoose.Types.ObjectId.isValid(id));
  }
  
  // Check for @everyone mention
  this.mentionEveryone = this.content.includes('@everyone') || this.content.includes('@here');
  
  next();
});

module.exports = mongoose.model('Message', messageSchema);