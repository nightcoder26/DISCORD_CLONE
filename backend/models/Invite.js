const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    index: true
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    default: null
  },
  uses: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  expiresAt: {
    type: Date,
    default: null // null means never expires
  },
  temporary: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient lookups
inviteSchema.index({ code: 1 });
inviteSchema.index({ server: 1 });
inviteSchema.index({ expiresAt: 1 });

// Pre-save middleware to generate invite code
inviteSchema.pre('save', async function(next) {
  if (!this.code) {
    let code;
    let isUnique = false;
    
    // Generate unique code
    while (!isUnique) {
      // Generate a random 7 character invite code
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      code = '';
      for (let i = 0; i < 7; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if code already exists
      const existing = await this.constructor.findOne({ code });
      if (!existing) {
        isUnique = true;
      }
    }
    
    this.code = code;
  }
  next();
});

// Method to check if invite is valid
inviteSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.maxUses > 0 && this.uses >= this.maxUses) return false;
  return true;
};

// Method to use invite
inviteSchema.methods.use = function() {
  this.uses += 1;
  if (this.maxUses > 0 && this.uses >= this.maxUses) {
    this.isActive = false;
  }
  return this.save();
};

module.exports = mongoose.model('Invite', inviteSchema);