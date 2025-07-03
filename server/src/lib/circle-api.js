import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

/**
 * Circle API client for interacting with the Circle Developer-Controlled Wallets API
 */
class CircleAPI {
  constructor() {
    // Initialize API configuration properties
    this.apiKey = process.env.CIRCLE_API_KEY;
    this.entitySecret = process.env.CIRCLE_ENTITY_SECRET;
    this.baseUrl = process.env.CIRCLE_API_BASE_URL || "https://api.circle.com";
    
    // Log API configuration details
    console.log("Circle API Base URL:", this.baseUrl);
    console.log("Circle API Key:", this.apiKey ? "Set" : "Not set");
    console.log("Circle Entity Secret:", this.entitySecret ? "Set" : "Not set");

    if (!this.apiKey) {
      console.warn("Warning: CIRCLE_API_KEY environment variable is not set");
    }

    if (!this.entitySecret) {
      console.warn("Warning: CIRCLE_ENTITY_SECRET environment variable is not set");
    }

    // Initialize the SDK client
    this.initializeClient();
  }

  /**
   * Initialize the SDK client with current configuration
   */
  initializeClient() {
    try {
      this.client = initiateDeveloperControlledWalletsClient({
        apiKey: this.apiKey,
        entitySecret: this.entitySecret,
        baseUrl: this.baseUrl
      });
      console.log("Circle Developer-Controlled Wallets client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Circle client:", error.message);
      throw new Error("Failed to initialize Circle client. Please check your API key and entity secret.");
    }
  }

  /**
   * Create a new wallet set for a user
   * @param {string} name - Name for the wallet set
   * @returns {Promise<object>} Wallet set creation response
   */
  async createWalletSet(name) {
    try {
      console.log(`Creating Circle wallet set with name: ${name}`);
      const response = await this.client.createWalletSet({ name });
      return response;
    } catch (error) {
      console.error("Error creating wallet set:", error.message);
      throw error;
    }
  }

  /**
   * Create a new wallet for a user
   * @param {string} walletSetId - ID of the wallet set
   * @param {string} blockchain - Blockchain to use (e.g., ETH-SEPOLIA, MATIC-AMOY)
   * @param {number} count - Number of wallets to create
   * @returns {Promise<object>} Wallet creation response
   */
  async createWallets(walletSetId, blockchain = "ETH-SEPOLIA", count = 1) {
    try {
      console.log(`Creating ${count} Circle wallet(s) on ${blockchain} blockchain for wallet set: ${walletSetId}`);
      const response = await this.client.createWallets({
        walletSetId,
        blockchains: [blockchain],
        count
      });
      return response;
    } catch (error) {
      console.error("Error creating wallets:", error.message);
      throw error;
    }
  }

  /**
   * List all wallets
   * @param {object} options - Options for listing wallets (userId, walletSetId, etc.)
   * @returns {Promise<object>} Wallets list response
   */
  async listWallets(options = {}) {
    try {
      return await this.client.listWallets(options);
    } catch (error) {
      console.error("Error listing wallets:", error.message);
      throw error;
    }
  }

  /**
   * Get wallet by ID
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} Wallet details
   */
  async getWallet(walletId) {
    try {
      return await this.client.getWallet({ walletId });
    } catch (error) {
      console.error("Error getting wallet:", error.message);
      throw error;
    }
  }

  /**
   * Create a transaction
   * @param {object} options - Transaction options
   * @returns {Promise<object>} Transaction creation response
   */
  async createTransaction(options) {
    try {
      return await this.client.createTransaction(options);
    } catch (error) {
      console.error("Error creating transaction:", error.message);
      throw error;
    }
  }

  /**
   * Estimate transaction fee
   * @param {object} options - Fee estimation options
   * @returns {Promise<object>} Fee estimation response
   */
  async estimateTransactionFee(options) {
    try {
      return await this.client.estimateTransferFee(options);
    } catch (error) {
      console.error("Error estimating transaction fee:", error.message);
      throw error;
    }
  }

  /**
   * Onboard a new user and create a wallet in a single operation
   * @param {string} email - User's email address
   * @param {string} blockchain - Blockchain to use
   * @returns {Promise<object>} Object containing wallet set and wallet information
   */
  async onboardUser(email, blockchain = "ETH-SEPOLIA") {
    try {
      // Step 1: Create wallet set with user's email as name
      const walletSetName = `WalletSet for ${email}`;
      const walletSetResponse = await this.createWalletSet(walletSetName);
      
      if (!walletSetResponse.data?.walletSet?.id) {
        throw new Error("Failed to create wallet set");
      }
      
      const walletSetId = walletSetResponse.data.walletSet.id;
      
      // Step 2: Create wallet for the wallet set
      const walletsResponse = await this.createWallets(walletSetId, blockchain);
      
      if (!walletsResponse.data?.wallets?.length) {
        throw new Error("Failed to create wallet");
      }

      // Return combined result
      return {
        walletSet: walletSetResponse.data.walletSet,
        wallet: walletsResponse.data.wallets[0]
      };
    } catch (error) {
      console.error("Error onboarding user:", error.message);
      throw error;
    }
  }

  /**
   * Transfer USDC from Circle wallet to MetaMask wallet
   * @param {object} options - Transfer options
   * @param {string} options.walletId - Source Circle wallet ID
   * @param {string} options.destinationAddress - Destination MetaMask wallet address
   * @param {string} options.amount - Amount to transfer in USDC (e.g., "10.00")
   * @param {string} options.tokenId - Token ID for USDC
   * @returns {Promise<object>} Transfer response
   */
  async transferToMetaMask(options) {
    try {
      console.log(`Initiating transfer from wallet ${options.walletId} to MetaMask address ${options.destinationAddress}`);
      
      const transferOptions = {
        walletId: options.walletId,
        destinationAddress: options.destinationAddress,
        amounts: [options.amount],
        tokenId: options.tokenId,
        fee: {
          type: 'level',
          config: {
            feeLevel: 'MEDIUM'
          }
        }
      };

      const response = await this.client.transfer(transferOptions);
      return response;
    } catch (error) {
      console.error("Error transferring to MetaMask:", error.message);
      throw error;
    }
  }

  /**
   * Get wallet balance
   * @param {string} walletId - Wallet ID
   * @returns {Promise<object>} Wallet balance response
   */
  async getWalletBalance(walletId) {
    try {
      console.log(`Getting balance for wallet: ${walletId}`);
      
      // Use direct API call instead of SDK method
      const url = `${this.baseUrl}/v1/w3s/wallets/${walletId}/balances`;
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch wallet balance: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting wallet balance:", error.message);
      throw error;
    }
  }
}

/**
 * Extract error details from Circle API errors
 * @param {Error} error - The caught error
 * @returns {object} Object containing error message and status code
 */
export function getCircleErrorDetails(error) {
  // Default error message and status code
  let message = "An error occurred with Circle API";
  let statusCode = 500;

  if (error.response) {
    // The request was made and the server responded with an error status
    statusCode = error.response.status || 500;
    message = error.response.message || error.message || "Circle API error";
    
    // Log detailed error information
    console.error("Circle API Error Response:", {
      status: statusCode,
      message: message,
      data: error.response.data
    });
    
  } else if (error.request) {
    // The request was made but no response was received
    message = "No response received from Circle API";
    statusCode = 503; // Service Unavailable
    console.error("Circle API Request Error (No Response):", error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Circle API Error:", error.message);
  }

  return { message, statusCode };
}

// Export a singleton instance of the API client
export const circleAPI = new CircleAPI();
