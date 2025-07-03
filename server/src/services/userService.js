import User from '../models/User.js';
import crypto from 'crypto';

/**
 * Generate a unique identifier for users without email
 */
function generateUniqueId() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * User service for database operations
 */
export const userService = {
  /**
   * Create a new user
   */
  async createUser(email = null, signupMethod = 'CIRCLE') {
    try {
      // If email is provided, check if user exists
      if (email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          return {
            success: false,
            message: 'User already exists',
            user: existingUser
          };
        }
      }

      // Create user data object
      const userData = {
        signupMethod
      };

      // Add email if provided, otherwise generate a unique identifier
      if (email) {
        userData.email = email;
      }

      const newUser = new User(userData);
      await newUser.save();

      return {
        success: true,
        message: 'User created successfully',
        user: newUser
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Create a new user with Circle signup (legacy method)
   */
  async createCircleUser(email, circleUserId, encryptionKey) {
    console.warn('Using deprecated createCircleUser method. Use createUser instead.');
    try {
      return await this.createUser(email, 'CIRCLE');
    } catch (error) {
      console.error('Error creating Circle user:', error);
      throw error;
    }
  },

  /**
   * Create a new user with MetaMask signup
   */
  async createMetamaskUser(email, walletAddress) {
    try {
      const existingUser = await User.findByEmail(email);
      
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists',
          user: existingUser
        };
      }

      // Check if wallet is already linked to another user
      const walletUser = await User.findByWalletAddress(walletAddress);
      if (walletUser) {
        return {
          success: false,
          message: 'Wallet address is already linked to another user',
          user: null
        };
      }

      const newUser = new User({
        email,
        signupMethod: 'METAMASK',
        wallets: [{
          provider: 'METAMASK',
          address: walletAddress,
          blockchain: 'ETHEREUM',
          state: 'LIVE'
        }]
      });

      await newUser.save();

      return {
        success: true,
        message: 'User created successfully with MetaMask',
        user: newUser
      };
    } catch (error) {
      console.error('Error creating MetaMask user:', error);
      throw error;
    }
  },

  /**
   * Add a Circle wallet to an existing user
   */
  async addCircleWallet(userId, walletData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Prepare wallet data
      const wallet = {
        provider: 'CIRCLE',
        walletId: walletData.id,
        walletSetId: walletData.walletSetId,
        address: walletData.address,
        blockchain: walletData.blockchain,
        state: walletData.state,
        custodyType: walletData.custodyType || 'DEVELOPER',
        accountType: walletData.accountType || 'EOA',
        createdAt: walletData.createDate || new Date()
      };

      // Add wallet to user
      user.wallets.push(wallet);
      await user.save();

      return {
        success: true,
        message: 'Wallet added successfully',
        wallet
      };
    } catch (error) {
      console.error('Error adding Circle wallet:', error);
      throw error;
    }
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      return await User.findByEmail(email);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  /**
   * Find user by Circle user ID
   */
  async findByCircleUserId(circleUserId) {
    try {
      return await User.findByCircleUserId(circleUserId);
    } catch (error) {
      console.error('Error finding user by Circle ID:', error);
      throw error;
    }
  },

  /**
   * Find user by wallet address
   */
  async findByWalletAddress(address) {
    try {
      return await User.findByWalletAddress(address);
    } catch (error) {
      console.error('Error finding user by wallet address:', error);
      throw error;
    }
  },

  /**
   * Get all users (with pagination)
   */
  async getAllUsers(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const users = await User.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
        
      const total = await User.countDocuments();
      
      return {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
};

export default userService; 