import mongoose from 'mongoose';

// Define wallet schema (embedded document)
const WalletSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['CIRCLE', 'METAMASK'],
    required: true
  },
  walletId: {
    type: String,
    sparse: true // Allows null values while maintaining uniqueness for non-null values
  },
  walletSetId: {
    type: String,
    sparse: true
  },
  address: {
    type: String,
    required: true
  },
  blockchain: {
    type: String,
    enum: ['ETH', 'ETH-SEPOLIA', 'MATIC', 'MATIC-AMOY', 'AVAX', 'AVAX-FUJI', 'SOL', 'SOL-DEVNET', 'ARB', 'ARB-SEPOLIA', 'ETHEREUM', 'BASE', 'OTHER'],
    default: 'ETH-SEPOLIA'
  },
  state: {
    type: String,
    default: 'LIVE'
  },
  custodyType: {
    type: String,
    enum: ['DEVELOPER', 'ENDUSER'],
    default: 'DEVELOPER'
  },
  accountType: {
    type: String,
    enum: ['EOA', 'SCA'],
    default: 'EOA'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // Don't create _id for embedded documents

// Define user schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: false // Remove automatic index
  },
  signupMethod: {
    type: String,
    enum: ['CIRCLE', 'METAMASK'],
    required: true
  },
  circleUserId: {
    type: String,
    sparse: true // Allows null values while maintaining uniqueness for non-null values
  },
  wallets: [WalletSchema], // Array of wallets
  autoTopup: {
    enabled: {
      type: Boolean,
      default: false
    },
    thresholdAmount: {
      type: String, // Store as string to maintain decimal precision
      default: '0.00'
    },
    lastChecked: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Create a unique index on email that allows null values
UserSchema.index({ email: 1 }, { 
  unique: true, 
  sparse: true, // This ensures uniqueness only applies to non-null values
  partialFilterExpression: { email: { $type: "string" } } // Only index documents where email is a string
});

// Create index for wallet addresses
UserSchema.index({ 'wallets.address': 1 }, { sparse: true });
// Create index for circleUserId
UserSchema.index({ 'circleUserId': 1 }, { sparse: true });

// Methods
UserSchema.methods.addWallet = function(walletData) {
  this.wallets.push(walletData);
  return this.save();
};

UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Pre-save middleware
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods for querying
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByCircleUserId = function(circleUserId) {
  return this.findOne({ circleUserId });
};

UserSchema.statics.findByWalletAddress = function(address) {
  return this.findOne({ 'wallets.address': address });
};

// Create model
const User = mongoose.model('User', UserSchema);

export default User; 