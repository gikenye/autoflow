import express from 'express';
import { body, validationResult } from 'express-validator';
import { circleAPI, getCircleErrorDetails } from '../lib/circle-api.js';
import { userService } from '../services/userService.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Validation middleware for email
 */
const validateEmail = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('If provided, email must be a valid email address')
    .normalizeEmail(),
];

/**
 * Validation middleware for blockchain
 */
const validateBlockchain = [
  body('blockchain')
    .optional()
    .isIn(['ETH-SEPOLIA', 'MATIC-AMOY'])
    .withMessage('Blockchain must be a supported blockchain network'),
];

/**
 * Validation middleware for userId
 */
const validateUserId = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string'),
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => err.msg).join(', ');
    console.error('Validation errors:', { errors: errors.array(), requestBody: req.body });
    return res.status(400).json({
      error: 'Validation failed',
      details: errorDetails
    });
  }
  next();
};

/**
 * POST /api/circle/users
 * Create a new user with wallet
 */
router.post('/users', validateEmail, validateBlockchain, handleValidationErrors, async (req, res) => {
  try {
    const { email, blockchain = 'ETH-SEPOLIA' } = req.body;

    console.log(`Creating user with wallet${email ? ` for email: ${email}` : ''} on ${blockchain}`);
    
    // Step 1: Create wallet set for the user
    const walletSetName = email ? `WalletSet for ${email}` : `WalletSet ${Date.now()}`;
    console.log('Creating Circle wallet set with name:', walletSetName);
    
    const walletSetResponse = await circleAPI.createWalletSet(walletSetName);
    
    if (!walletSetResponse.data?.walletSet?.id) {
      console.error('Failed to create wallet set:', { response: walletSetResponse });
      return res.status(500).json({
        error: 'Failed to create wallet set',
        details: 'Could not get wallet set ID from response'
      });
    }
    
    const walletSetId = walletSetResponse.data.walletSet.id;
    
    // Step 2: Create wallet in the wallet set
    console.log(`Creating Circle wallet(s) on ${blockchain} blockchain for wallet set:`, walletSetId);
    const walletsResponse = await circleAPI.createWallets(walletSetId, blockchain, 1);
    
    if (!walletsResponse.data?.wallets?.length) {
      console.error('Failed to create wallet:', { response: walletsResponse });
      return res.status(500).json({
        error: 'Failed to create wallet',
        details: 'Could not create wallet or wallet not returned in response'
      });
    }
    
    const wallet = walletsResponse.data.wallets[0];

    // Step 3: Only after Circle API success, check for existing user
    if (email) {
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        console.warn('User already exists for email:', email);
        return res.status(409).json({
          error: 'User already exists',
          details: 'A user with this email already exists'
        });
      }
    }
    
    // Step 4: Create user in database
    const dbResult = await userService.createUser(email);

    // Step 5: Add wallet to user in database
    if (dbResult.success) {
      await userService.addCircleWallet(dbResult.user._id, wallet);
    }

    res.status(201).json({
      success: true,
      data: {
        email: email || null,
        dbId: dbResult.user._id,
        walletSetId: walletSetId,
        walletId: wallet.id,
        address: wallet.address,
        blockchain: wallet.blockchain,
        state: wallet.state,
        accountType: wallet.accountType || 'EOA',
        custodyType: wallet.custodyType || 'DEVELOPER',
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating user with wallet:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    
    const { message, statusCode } = getCircleErrorDetails(error);
    
    res.status(statusCode).json({
      error: message,
      details: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      }
    });
  }
});

/**
 * POST /api/circle/wallets
 * Create a wallet set and wallet
 */
router.post('/wallets', 
  validateEmail,
  validateBlockchain, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { email, blockchain = 'ETH-SEPOLIA' } = req.body;

      console.log(`Creating Circle wallet${email ? ` for email: ${email}` : ''} on ${blockchain}`);
      
      // Step 1: Create wallet set
      const walletSetName = email ? `WalletSet for ${email}` : `WalletSet ${Date.now()}`;
      console.log('Creating Circle wallet set with name:', walletSetName);
      
      const walletSetResponse = await circleAPI.createWalletSet(walletSetName);
      
      if (!walletSetResponse.data?.walletSet?.id) {
        console.error('Failed to create wallet set:', { response: walletSetResponse });
        return res.status(500).json({
          error: 'Failed to create wallet set',
          details: 'Could not get wallet set ID from response'
        });
      }
      
      const walletSetId = walletSetResponse.data.walletSet.id;
      
      // Step 2: Create wallet in the wallet set
      console.log(`Creating Circle wallet(s) on ${blockchain} blockchain for wallet set:`, walletSetId);
      const walletsResponse = await circleAPI.createWallets(walletSetId, blockchain, 1);
      
      if (!walletsResponse.data?.wallets?.length) {
        console.error('Failed to create wallet:', { response: walletsResponse });
        return res.status(500).json({
          error: 'Failed to create wallet',
          details: 'Could not create wallet or wallet not returned in response'
        });
      }
      
      const wallet = walletsResponse.data.wallets[0];

      // Step 3: Only after Circle API success, handle user creation/lookup
      let user;
      if (email) {
        // Find existing user by email
        user = await userService.findByEmail(email);
        if (!user) {
          // Create new user with email
          const dbResult = await userService.createUser(email);
          if (!dbResult.success) {
            throw new Error(dbResult.message || 'Failed to create user');
          }
          user = dbResult.user;
        }
      } else {
        // Create new user without email
        const dbResult = await userService.createUser(null);
        if (!dbResult.success) {
          throw new Error(dbResult.message || 'Failed to create user');
        }
        user = dbResult.user;
      }

      // Step 4: Add wallet to user
      await userService.addCircleWallet(user._id, wallet);

      res.status(201).json({
        success: true,
        data: {
          walletId: wallet.id,
          walletSetId: wallet.walletSetId,
          address: wallet.address,
          blockchain: wallet.blockchain,
          state: wallet.state,
          accountType: wallet.accountType || 'EOA',
          custodyType: wallet.custodyType,
          createdAt: wallet.createDate,
          userId: user._id,
          email: user.email || null
        }
      });

    } catch (error) {
      console.error('Error creating Circle wallet:', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      
      const { message, statusCode } = getCircleErrorDetails(error);
      
      res.status(statusCode).json({
        error: message,
        details: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name
        }
      });
    }
  }
);

/**
 * POST /api/circle/onboard
 * Complete onboarding: create wallet set and wallet in a single operation
 */
router.post('/onboard', 
  validateEmail, 
  validateBlockchain, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { email, blockchain = 'ETH-SEPOLIA' } = req.body;

      console.log(`Starting onboarding for email: ${email} on ${blockchain}`);
      
      // Check if user already exists
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        console.warn('User already exists for email:', email);
        return res.status(409).json({
          error: 'User already exists',
          details: 'A user with this email already exists'
        });
      }
      
      // Onboard user with Circle
      const result = await circleAPI.onboardUser(email, blockchain);

      // Save user to database
      const dbResult = await userService.createUser(email);

      // Add wallet to user
      if (dbResult.success) {
        await userService.addCircleWallet(dbResult.user._id, result.wallet);
      }

      res.status(201).json({
        success: true,
        message: 'User successfully onboarded with Circle Developer-Controlled Wallet',
        data: {
          email: email,
          dbId: dbResult.user._id,
          walletSetId: result.walletSet.id,
          walletSetName: result.walletSet.name,
          walletSetCreatedAt: result.walletSet.createDate,
          walletId: result.wallet.id,
          walletAddress: result.wallet.address,
          blockchain: result.wallet.blockchain,
          walletState: result.wallet.state,
          accountType: result.wallet.accountType || 'EOA',
          custodyType: result.wallet.custodyType || 'DEVELOPER',
          walletCreatedAt: result.wallet.createDate
        }
      });

    } catch (error) {
      console.error('Error during user onboarding:', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      
      const { message, statusCode } = getCircleErrorDetails(error);
      
      res.status(statusCode).json({
        error: message,
        details: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name
        }
      });
    }
  }
);

/**
 * GET /api/circle/users/:userId
 * Get user information
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      console.warn('User ID not provided');
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    console.log(`Getting user: ${userId}`);

    // Try to fetch from database
    let user;
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userId);
      
      if (user) {
        return res.json({
          success: true,
          data: user
        });
      } else {
        console.warn('User not found for ID:', userId);
        return res.status(404).json({
          error: 'User not found',
          details: 'No user found with the provided ID'
        });
      }
    } else {
      console.warn('Invalid user ID format:', userId);
      return res.status(400).json({
        error: 'Invalid user ID format',
        details: 'User ID must be a valid MongoDB ObjectId'
      });
    }
  } catch (error) {
    console.error('Error getting user:', {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId
    });
    
    res.status(500).json({
      error: 'Failed to get user',
      details: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      }
    });
  }
});

/**
 * GET /api/circle/users/:userId/wallets
 * Get all wallets for a user
 */
router.get('/users/:userId/wallets', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      console.warn('User ID not provided');
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    console.log(`Getting wallets for user: ${userId}`);
    
    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn('Invalid user ID format:', userId);
      return res.status(400).json({
        error: 'Invalid user ID format',
        details: 'User ID must be a valid MongoDB ObjectId'
      });
    }
    
    // Fetch from database
    const user = await User.findById(userId);
    
    if (!user) {
      console.warn('User not found for ID:', userId);
      return res.status(404).json({
        error: 'User not found',
        details: 'No user found with the provided ID'
      });
    }

    return res.json({
      success: true,
      data: {
        wallets: user.wallets || [],
        count: user.wallets ? user.wallets.length : 0
      }
    });

  } catch (error) {
    console.error('Error getting user wallets:', {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId
    });
    
    res.status(500).json({
      error: 'Failed to get user wallets',
      details: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      }
    });
  }
});

/**
 * GET /api/circle/wallets/:walletId
 * Get wallet information by ID
 */
router.get('/wallets/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;

    if (!walletId) {
      console.warn('Wallet ID not provided');
      return res.status(400).json({
        error: 'Wallet ID is required'
      });
    }

    console.log(`Getting Circle wallet: ${walletId}`);

    const result = await circleAPI.getWallet(walletId);

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error getting Circle wallet:', {
      error: error.message,
      stack: error.stack,
      walletId: req.params.walletId
    });
    
    const { message, statusCode } = getCircleErrorDetails(error);
    
    res.status(statusCode).json({
      error: message,
      details: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      }
    });
  }
});

/**
 * GET /api/circle/wallets
 * List all wallets (with optional filters)
 */
router.get('/wallets', async (req, res) => {
  try {
    const { walletSetId, page, pageSize } = req.query;

    const options = {};
    if (walletSetId) options.walletSetId = walletSetId;
    if (page) options.page = page;
    if (pageSize) options.pageSize = pageSize;

    console.log(`Listing Circle wallets with options:`, options);
    
    const result = await circleAPI.listWallets(options);

    res.json({
      success: true,
      data: {
        wallets: result.data.wallets,
        count: result.data.wallets.length
      }
    });

  } catch (error) {
    console.error('Error listing wallets:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    
    const { message, statusCode } = getCircleErrorDetails(error);
    
    res.status(statusCode).json({
      error: message,
      details: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      }
    });
  }
});

/**
 * POST /api/circle/transaction
 * Create a new transaction
 */
router.post('/transaction', 
  [
    body('walletId').isString().withMessage('Wallet ID is required'),
    body('destinationAddress').isString().withMessage('Destination address is required'),
    body('amounts').isArray().withMessage('Amounts must be an array'),
    body('tokenId').isString().withMessage('Token ID is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { 
        walletId, 
        destinationAddress, 
        amounts, 
        tokenId,
        feeLevel = 'MEDIUM' 
      } = req.body;

      console.log(`Creating transaction for wallet: ${walletId}`);
      
      // Create transaction
      const result = await circleAPI.createTransaction({
        walletId,
        destinationAddress,
        amounts,
        tokenId,
        fee: { 
          type: 'level', 
          config: { 
            feeLevel 
          } 
        }
      });

      res.status(201).json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('Error creating transaction:', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      
      const { message, statusCode } = getCircleErrorDetails(error);
      
      res.status(statusCode).json({
        error: message,
        details: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name
        }
      });
    }
  }
);

/**
 * POST /api/circle/metamask
 * Register a user with MetaMask wallet
 */
router.post('/metamask', 
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('address').isString().withMessage('Wallet address is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, address } = req.body;

      console.log(`Registering MetaMask user: ${email} with address: ${address}`);
      
      const result = await userService.createMetamaskUser(email, address);
      
      if (!result.success) {
        console.warn('Failed to create MetaMask user:', result.message);
        return res.status(409).json({
          success: false,
          error: result.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'User registered with MetaMask successfully',
        data: {
          userId: result.user._id,
          email: result.user.email,
          walletAddress: address,
          signupMethod: 'METAMASK',
          createdAt: result.user.createdAt
        }
      });

    } catch (error) {
      console.error('Error registering MetaMask user:', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to register user with MetaMask',
        details: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name
        }
      });
    }
  }
);

/**
 * GET /api/circle/users
 * Get all users (with pagination)
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await userService.getAllUsers(page, limit);
    
    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting all users:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      details: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      }
    });
  }
});

export default router;