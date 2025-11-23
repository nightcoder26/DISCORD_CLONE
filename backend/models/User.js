const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'https://cdn.discordapp.com/embed/avatars/0.png'
  },
  googleId: {
    type: String,
    sparse: true
  },
  discriminator: {
    type: String,
    required: true,
    length: 4
  },
  status: {
    type: String,
    enum: ['online', 'idle', 'dnd', 'invisible'],
    default: 'online'
  },
  customStatus: {
    type: String,
    maxlength: 128
  },
  servers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server'
  }],
  friends: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending'
    }
  }],
  directMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DirectMessage'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate discriminator before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.discriminator) {
    // Generate a random 4-digit discriminator
    this.discriminator = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Check if username#discriminator combo already exists
    const existingUser = await mongoose.model('User').findOne({
      username: this.username,
      discriminator: this.discriminator
    });
    
    if (existingUser) {
      // Recursively try again with a new discriminator
      this.discriminator = undefined;
      return this.save();
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate full username with discriminator
userSchema.virtual('fullUsername').get(function() {
  return `${this.username}#${this.discriminator}`;
});

// Transform output to remove sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.googleId;
  return user;
};

// Create compound index for username + discriminator uniqueness
userSchema.index({ username: 1, discriminator: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);