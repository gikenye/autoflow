/**
 * Circle API Client for Frontend
 * 
 * This utility library provides functions for interacting with the AutoFlow backend server
 * which handles Circle Programmable Wallets API integration.
 */

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types
export interface OnboardingData {
  userId: string;
  userToken: string;
  encryptionKey: string;
  email: string;
  userCreatedAt: string;
  walletId: string;
  walletSetId: string;
  walletAddress: string;
  blockchain: string;
  walletState: string;
  accountType: string;
  custodyType: string;
  walletCreatedAt: string;
  supportedCurrency: string;
}

export interface UserData {
  userId: string;
  userToken: string;
  encryptionKey: string;
  email: string;
  createdAt: string;
}

export interface WalletData {
  walletId: string;
  walletSetId: string;
  address: string;
  blockchain: string;
  state: string;
  accountType: string;
  custodyType: string;
  createdAt: string;
  currency: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

export type SupportedBlockchain = 'ETH-SEPOLIA' | 'ETH-SEPOLIA';

/**
 * Base API request function with error handling
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Check server health
 */
export async function checkServerHealth(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    throw new Error('Server is not responding');
  }
}

/**
 * Complete user onboarding: create user and wallet in one operation
 * @param email - User's email address
 * @param blockchain - Target blockchain (defaults to ETH-SEPOLIA)
 * @returns Promise<OnboardingData>
 */
export async function onboardUser(
  email: string,
  blockchain: SupportedBlockchain = process.env.NEXT_PUBLIC_BLOCKCHAIN as SupportedBlockchain
): Promise<OnboardingData> {
  const response = await apiRequest<OnboardingData>('/api/circle/onboard', {
    method: 'POST',
    body: JSON.stringify({ email, blockchain }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Onboarding failed');
  }

  return response.data;
}

/**
 * Create a new Circle user
 * @param email - User's email address
 * @returns Promise<UserData>
 */
export async function createUser(email: string): Promise<UserData> {
  const response = await apiRequest<UserData>('/api/circle/users', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'User creation failed');
  }

  return response.data;
}

/**
 * Create a wallet for an existing user
 * @param userId - Circle user ID
 * @param blockchain - Target blockchain (defaults to ETH-SEPOLIA)
 * @returns Promise<WalletData>
 */
export async function createWallet(
  userId: string,
  blockchain: SupportedBlockchain = process.env.NEXT_PUBLIC_BLOCKCHAIN as SupportedBlockchain
): Promise<WalletData> {
  const response = await apiRequest<WalletData>('/api/circle/wallets', {
    method: 'POST',
    body: JSON.stringify({ userId, blockchain }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Wallet creation failed');
  }

  return response.data;
}

/**
 * Get user information
 * @param userId - Circle user ID
 * @returns Promise<UserData>
 */
export async function getUser(userId: string): Promise<any> {
  const response = await apiRequest(`/api/circle/users/${encodeURIComponent(userId)}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get user');
  }

  return response.data;
}

/**
 * Get all wallets for a user
 * @param userId - Circle user ID
 * @returns Promise<{wallets: any[], count: number}>
 */
export async function getUserWallets(userId: string): Promise<{ wallets: any[]; count: number }> {
  const response = await apiRequest<{ wallets: any[]; count: number }>(
    `/api/circle/users/${encodeURIComponent(userId)}/wallets`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get user wallets');
  }

  return response.data;
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns boolean
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate blockchain parameter
 * @param blockchain - Blockchain to validate
 * @returns boolean
 */
export function isValidBlockchain(blockchain: string): blockchain is SupportedBlockchain {
  return ['ETH-SEPOLIA', 'ETH-SEPOLIA'].includes(blockchain);
}

/**
 * Store user data in localStorage
 * @param userData - User data to store
 */
export function storeUserData(userData: OnboardingData | UserData): void {
  try {
    const dataToStore = {
      userId: userData.userId,
      userToken: userData.userToken,
      email: userData.email,
      ...(('walletId' in userData) && {
        walletId: userData.walletId,
        walletAddress: userData.walletAddress,
        blockchain: userData.blockchain,
      }),
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('circle_user_data', JSON.stringify(dataToStore));
  } catch (error) {
    console.warn('Failed to store user data in localStorage:', error);
  }
}

/**
 * Retrieve user data from localStorage
 * @returns Stored user data or null
 */
export function getStoredUserData(): any | null {
  try {
    const stored = localStorage.getItem('circle_user_data');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to retrieve user data from localStorage:', error);
    return null;
  }
}

/**
 * Clear stored user data
 */
export function clearStoredUserData(): void {
  try {
    localStorage.removeItem('circle_user_data');
  } catch (error) {
    console.warn('Failed to clear user data from localStorage:', error);
  }
}

/**
 * Get the configured API base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
} 