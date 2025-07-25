import express from 'express';
import { body, validationResult } from 'express-validator';
import { circleAPI, getCircleErrorDetails } from '../lib/circle-api.js';
import { userService } from '../services/userService.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Validation middleware
 */
const validateLinkWallet = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string'),
  body('metamaskWalletAddress')
    .notEmpty()
    .withMessage('MetaMask wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid MetaMask wallet address format. Must be a valid Ethereum address (0x followed by 40 hexadecimal characters)')
];

const validateTransfer = [
  body('circleWalletId')
    .notEmpty()
    .withMessage('Circle wallet ID is required')
    .isString()
    .withMessage('Circle wallet ID must be a string'),
  body('metamaskWalletAddress')
    .notEmpty()
    .withMessage('MetaMask wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid MetaMask wallet address format. Must be a valid Ethereum address (0x followed by 40 hexadecimal characters)'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .matches(/^\d+\.\d{2}$/)
    .withMessage('Amount must be in format "XX.XX" (e.g., "10.00")')
];

const validateAutoTopup = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string'),
  body('thresholdAmount')
    .notEmpty()
    .withMessage('Threshold amount is required')
    .matches(/^\d+\.\d{2}$/)
    .withMessage('Threshold amount must be in format "XX.XX"'),
  body('autoTransfer')
    .isBoolean()
    .withMessage('autoTransfer must be a boolean')
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
 * POST /api/metamask/link-wallet
 * Link MetaMask wallet to user account
 */
router.post('/link-wallet', validateLinkWallet, handleValidationErrors, async (req, res) => {
  try {
    const { userId, metamaskWalletAddress } = req.body;

    console.log(`Linking MetaMask wallet ${metamaskWalletAddress} to user ${userId}`);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: 'No user found with the provided ID'
      });
    }

    // Check if wallet address is already linked to another user
    const existingUser = await User.findByWalletAddress(metamaskWalletAddress);
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(409).json({
        error: 'Wallet already linked',
        details: 'This MetaMask wallet is already linked to another user'
      });
    }

    // Add or update MetaMask wallet
    const metamaskWallet = {
      provider: 'METAMASK',
      address: metamaskWalletAddress,
      blockchain: 'ETHEREUM',
      state: 'LIVE'
    };

    // Remove any existing MetaMask wallets
    user.wallets = user.wallets.filter(w => w.provider !== 'METAMASK');
    user.wallets.push(metamaskWallet);
    await user.save();

    res.json({
      success: true,
      message: 'MetaMask wallet linked successfully',
      data: {
        userId: user._id,
        metamaskWalletAddress,
        linkDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error linking MetaMask wallet:', error);
    res.status(500).json({
      error: 'Failed to link MetaMask wallet',
      details: error.message
    });
  }
});

/**
 * POST /api/metamask/transfer-to-metamask
 * Transfer USDC from Circle wallet to MetaMask
 */
router.post('/transfer-to-metamask', validateTransfer, handleValidationErrors, async (req, res) => {
  try {
    const { circleWalletId, metamaskWalletAddress, amount } = req.body;
    const tokenId = process.env.CIRCLE_USDC_TOKEN_ID;

    if (!tokenId) {
      return res.status(500).json({
        error: 'Configuration error',
        details: 'CIRCLE_USDC_TOKEN_ID environment variable is not set'
      });
    }

    console.log(`Initiating transfer of ${amount} USDC from ${circleWalletId} to ${metamaskWalletAddress}`);

    // Verify Circle wallet exists and has sufficient balance
    const balanceResponse = await circleAPI.getWalletBalance(circleWalletId);
    const balance = balanceResponse.data?.tokenBalances?.[0]?.amount || '0.00';
    
    if (parseFloat(balance) < parseFloat(amount)) {
      return res.status(400).json({
        error: 'Insufficient balance',
        details: `Wallet has ${balance} USDC, but ${amount} USDC was requested`
      });
    }

    // Initiate transfer
    const transferResponse = await circleAPI.transferToMetaMask({
      walletId: circleWalletId,
      destinationAddress: metamaskWalletAddress,
      amount,
      tokenId
    });

    res.json({
      success: true,
      message: 'Transfer initiated successfully',
      data: {
        transferId: transferResponse.data.transfer.id,
        status: transferResponse.data.transfer.status,
        amount,
        sourceWallet: circleWalletId,
        destinationAddress: metamaskWalletAddress,
        transactionHash: transferResponse.data.transfer.transactionHash,
        createdAt: transferResponse.data.transfer.createDate
      }
    });

  } catch (error) {
    console.error('Error transferring to MetaMask:', error);
    const { message, statusCode } = getCircleErrorDetails(error);
    res.status(statusCode).json({
      error: message,
      details: error.message
    });
  }
});

/**
 * GET /api/metamask/user-wallets/:userId
 * Get user's wallet information
 */
router.get('/user-wallets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`Getting wallet information for user ${userId}`);

    // Find user and their wallets
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: 'No user found with the provided ID'
      });
    }

    // Get Circle wallet balance if exists
    const circleWallet = user.wallets.find(w => w.provider === 'CIRCLE');
    let circleBalance = '0.00';
    
    if (circleWallet) {
      const balanceResponse = await circleAPI.getWalletBalance(circleWallet.walletId);
      circleBalance = balanceResponse.data?.tokenBalances?.[0]?.amount || '0.00';
    }

    // Get MetaMask wallet if exists
    const metamaskWallet = user.wallets.find(w => w.provider === 'METAMASK');

    res.json({
      success: true,
      data: {
        userId: user._id,
        circleWallet: circleWallet ? {
          walletId: circleWallet.walletId,
          address: circleWallet.address,
          balance: circleBalance,
          blockchain: circleWallet.blockchain
        } : null,
        metamaskWallet: metamaskWallet ? {
          address: metamaskWallet.address,
          blockchain: metamaskWallet.blockchain
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting user wallets:', error);
    res.status(500).json({
      error: 'Failed to get user wallets',
      details: error.message
    });
  }
});

/**
 * POST /api/metamask/schedule-auto-topup
 * Configure automatic top-up settings
 */
router.post('/schedule-auto-topup', validateAutoTopup, handleValidationErrors, async (req, res) => {
  try {
    const { userId, thresholdAmount, autoTransfer } = req.body;

    console.log(`Configuring auto top-up for user ${userId}`);

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: 'No user found with the provided ID'
      });
    }

    // Verify user has both Circle and MetaMask wallets
    const hasCircleWallet = user.wallets.some(w => w.provider === 'CIRCLE');
    const hasMetaMaskWallet = user.wallets.some(w => w.provider === 'METAMASK');

    if (!hasCircleWallet || !hasMetaMaskWallet) {
      return res.status(400).json({
        error: 'Missing wallets',
        details: 'User must have both Circle and MetaMask wallets configured'
      });
    }

    // Save auto top-up settings to user
    user.autoTopup = {
      enabled: autoTransfer,
      thresholdAmount,
      lastChecked: new Date(),
      createdAt: new Date()
    };
    await user.save();

    res.json({
      success: true,
      message: 'Auto top-up settings saved successfully',
      data: {
        userId: user._id,
        autoTopup: user.autoTopup
      }
    });

  } catch (error) {
    console.error('Error configuring auto top-up:', error);
    res.status(500).json({
      error: 'Failed to configure auto top-up',
      details: error.message
    });
  }
});

/**
 * POST /api/metamask/create-metamask-card-wallet
 * Create a second Circle wallet for a user to simulate MetaMask Card
 */
router.post('/create-metamask-card-wallet', async (req, res) => {
  try {
    // Get user from session or token
    // In a real app, you would get the user ID from the authenticated session
    // For this example, we'll use a user ID from the request body or query
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Find the user in the database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user already has a MetaMask Card wallet
    const existingMetaMaskCard = user.wallets.find(wallet => wallet.provider === 'CIRCLE' && wallet.walletId.includes('metamask-card'));
    
    if (existingMetaMaskCard) {
      return res.status(200).json({
        success: true,
        message: 'MetaMask Card wallet already exists',
        data: {
          walletId: existingMetaMaskCard.walletId,
          address: existingMetaMaskCard.address
        }
      });
    }

    // Get the user's primary wallet set ID
    const primaryWallet = user.wallets.find(wallet => wallet.provider === 'CIRCLE');
    
    if (!primaryWallet || !primaryWallet.walletSetId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have a primary Circle wallet'
      });
    }

    // Create a new wallet in the same wallet set
    const walletSetId = primaryWallet.walletSetId;
    const blockchain = primaryWallet.blockchain || 'ETH-SEPOLIA';
    
    console.log(`Creating MetaMask Card wallet for user ${userId} in wallet set ${walletSetId}`);
    const walletsResponse = await circleAPI.createWallets(walletSetId, blockchain, 1);
    
    if (!walletsResponse.data?.wallets?.length) {
      console.error('Failed to create MetaMask Card wallet:', { response: walletsResponse });
      return res.status(500).json({
        success: false,
        error: 'Failed to create MetaMask Card wallet',
        details: 'Could not create wallet or wallet not returned in response'
      });
    }
    
    const wallet = walletsResponse.data.wallets[0];
    
    // Prepare wallet data with special tag for MetaMask Card
    const metamaskCardWallet = {
      provider: 'CIRCLE',
      walletId: `${wallet.id}-metamask-card`, // Tag the wallet ID to identify it as a MetaMask Card
      walletSetId: wallet.walletSetId,
      address: wallet.address,
      blockchain: wallet.blockchain,
      state: wallet.state,
      custodyType: wallet.custodyType || 'DEVELOPER',
      accountType: wallet.accountType || 'EOA',
      createdAt: wallet.createDate || new Date()
    };

    // Add wallet to user
    user.wallets.push(metamaskCardWallet);
    await user.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'MetaMask Card wallet created successfully',
      data: {
        walletId: metamaskCardWallet.walletId,
        address: metamaskCardWallet.address,
        blockchain: metamaskCardWallet.blockchain,
        state: metamaskCardWallet.state
      }
    });

  } catch (error) {
    console.error('Error creating MetaMask Card wallet:', {
      error: error.message,
      stack: error.stack
    });
    
    const { message, statusCode } = getCircleErrorDetails(error);
    
    res.status(statusCode).json({
      success: false,
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

export default router; 