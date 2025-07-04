"use client"

import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
  useEffect,
} from "react"
import axios from "axios"
import { fetchCircleWalletBalance } from "@/lib/circle-client"

export interface User {
  address: string
  email?: string
  name?: string
  profileImage?: string
  provider: "circle" | "metamask"
}

export interface CardInfo {
  isLinked?: boolean
  balance?: number
  limit?: number
  lastFour?: string
  status?: string
  metamaskCardAddress?: string
}

export interface Transaction {
  id: string;
  type: "deposit" | "spend" | "transfer" | "yield" | "topup";
  amount: number;
  timestamp: Date;
  description: string;
  blockchain?: {
    txHash: string;
    blockNumber: number | null;
    gasUsed: number;
    gasPrice: string;
    gasFee: string;
    network: string;
    currency: string;
    fromAddress: string;
    toAddress: string;
    confirmations: number;
    status: "pending" | "processing" | "confirmed";
  }
}

export interface WalletContextType {
  user: User | null
  isLoading: boolean
  isConnected: boolean
  provider: any
  cardInfo: CardInfo | null
  transactions: Transaction[]
  connect: (method: "circle" | "metamask", userData?: any) => Promise<void>
  disconnect: () => Promise<void>
  getBalance: () => Promise<string>
  simulateSpend: (amount: number) => Promise<boolean>
  topUpCard: (amount: number) => Promise<boolean>
  transferToCard: (amount: number) => Promise<boolean>
  deposit: (amount: number, token: string) => Promise<boolean>
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void
}

// Context
const WalletContext = createContext<WalletContextType | null>(null)

export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<any>(null)
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null)
  const [walletBalance, setWalletBalance] = useState<number>(1000) // Simulated wallet balance
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Check for stored MetaMask Card wallet on mount
  useEffect(() => {
    const storedCardWallet = localStorage.getItem("metamask_card_wallet")
    if (storedCardWallet && cardInfo) {
      setCardInfo({
        ...cardInfo,
        isLinked: true,
        metamaskCardAddress: storedCardWallet
      })
    }
  }, [cardInfo])

  // Update blockchain transaction status for realistic simulation
  useEffect(() => {
    if (transactions.length === 0) return;

    // Update transaction confirmations and status
    const updateInterval = setInterval(() => {
      setTransactions(prevTxs => 
        prevTxs.map(tx => {
          if (!tx.blockchain) return tx;
          
          // If already confirmed with many confirmations, don't update
          if (tx.blockchain.status === "confirmed" && tx.blockchain.confirmations >= 12) {
            return tx;
          }
          
          // Create a copy of the blockchain data to update
          const updatedBlockchain = { ...tx.blockchain };
          
          // For pending transactions, change to processing after a delay
          if (updatedBlockchain.status === "pending") {
            // Set processing after 15-30 seconds from creation
            const txAge = new Date().getTime() - new Date(tx.timestamp).getTime();
            if (txAge > 15000) { // 15 seconds
              updatedBlockchain.status = "processing";
              // Assign a block number when processing starts
              updatedBlockchain.blockNumber = Math.floor(15000000 + Math.random() * 1000000);
              updatedBlockchain.confirmations = 1;
            }
          }
          // For processing transactions, increase confirmations
          else if (updatedBlockchain.status === "processing") {
            // Increment confirmations by 1
            updatedBlockchain.confirmations += 1;
            
            // Mark as confirmed after 6 confirmations
            if (updatedBlockchain.confirmations >= 6) {
              updatedBlockchain.status = "confirmed";
            }
          }
          // For confirmed transactions, keep increasing confirmations up to 12
          else if (updatedBlockchain.status === "confirmed" && updatedBlockchain.confirmations < 12) {
            updatedBlockchain.confirmations += 1;
          }
          
          return {
            ...tx,
            blockchain: updatedBlockchain
          };
        })
      );
    }, 15000); // Update every 15 seconds
    
    return () => clearInterval(updateInterval);
  }, [transactions]);

  const isConnected = !!user

  // Function to add a transaction to the history
  const addTransaction = useCallback((transaction: Omit<Transaction, "id" | "timestamp">) => {
    const now = new Date();
    
    // Generate blockchain transaction details
    const generateBlockchainDetails = () => {
      // Generate a transaction hash
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Generate blockchain addresses
      const fromAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const toAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Generate gas and network details based on transaction type
      const network = transaction.type === "spend" ? "Polygon" : "Ethereum";
      const currency = network === "Polygon" ? "MATIC" : "ETH";
      const gasUsed = Math.floor(21000 + Math.random() * 100000);
      const gasPrice = (Math.random() * 20 + 10).toFixed(2); // gwei
      const gasFee = (gasUsed * parseFloat(gasPrice) / 1e9).toFixed(6); // ETH
      
      // For new transactions, start with pending status
      // Block number will be null for pending transactions
      return {
        txHash,
        blockNumber: null, // Will be filled when confirmed
        gasUsed,
        gasPrice,
        gasFee,
        network,
        currency,
        fromAddress,
        toAddress,
        confirmations: 0,
        status: "pending" as const,
      };
    };
    
    setTransactions((prev) => [
      ...prev,
      {
        id: now.getTime().toString(), // Use timestamp for ID to ensure uniqueness
        timestamp: now,
        ...transaction,
        blockchain: generateBlockchainDetails(),
      },
    ]);
  }, []);

  const connect = useCallback(async (method: "circle" | "metamask", userData?: any) => {
    setIsLoading(true)
    try {
      if (method === "circle") {
        if (userData) {
          // Use provided Circle user data from onboarding
          setUser({
            address: userData.walletAddress,
            email: userData.email,
            name: userData.email.split('@')[0], // Use email prefix as name
            provider: "circle",
          })

          // Set card info for Circle users
          setCardInfo({
            isLinked: true,
            balance: userData.isExistingUser ? 450.00 : 650.00, // Simulate different balance for existing users
            limit: 800,
            lastFour: userData.isExistingUser ? "9876" : "5432", // Use different last four for existing users
            status: "active",
          })
          
          // Generate blockchain transaction data for sample transactions
          const generateHistoricalBlockchain = (daysAgo: number) => {
            const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            const fromAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            const toAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            const network = Math.random() > 0.3 ? "Ethereum" : "Polygon";
            const currency = network === "Polygon" ? "MATIC" : "ETH";
            const blockNumber = Math.floor(15000000 + Math.random() * 1000000);
            const gasUsed = Math.floor(21000 + Math.random() * 100000);
            const gasPrice = (Math.random() * 20 + 10).toFixed(2);
            const gasFee = (gasUsed * parseFloat(gasPrice) / 1e9).toFixed(6);
            
            // Older transactions have more confirmations and are fully confirmed
            return {
              txHash,
              blockNumber,
              gasUsed,
              gasPrice,
              gasFee,
              network,
              currency,
              fromAddress,
              toAddress,
              confirmations: Math.min(12, Math.floor((daysAgo + 1) * 2)),
              status: "confirmed" as const
            };
          };
          
          // Add sample transaction history
          addTransaction({
            type: "deposit",
            amount: 650.00,
            description: "Initial deposit",
            blockchain: generateHistoricalBlockchain(7) // 7 days ago
          });
          
          addTransaction({
            type: "yield",
            amount: 4.32,
            description: "Interest earned",
            blockchain: generateHistoricalBlockchain(3) // 3 days ago
          });
        } else {
          // Fallback for existing Circle connections
          const res = await axios.post("/api/circle/wallet")
          const { address, email, name, profileImage } = res.data

          setUser({
            address,
            email,
            name,
            profileImage,
            provider: "circle",
          })

          setCardInfo({
            isLinked: true,
            balance: 650,
            limit: 800,
            lastFour: "9876",
            status: "active",
          })
          
          // Add sample transaction history
          addTransaction({
            type: "deposit",
            amount: 650.00,
            description: "Initial deposit"
          });
        }
      } else {
        const ethereum = (window as any).ethereum
        if (!ethereum) throw new Error("MetaMask not installed")

        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        })

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found")
        }

        setUser({
          address: accounts[0],
          provider: "metamask",
        })

        setProvider(ethereum)

        // Mock MetaMask card info
        const isLinked = Math.random() > 0.3
        setCardInfo({
          isLinked,
          balance: isLinked ? 847.32 : undefined,
          limit: isLinked ? 950 : undefined,
          lastFour: isLinked ? "1234" : undefined,
          status: isLinked ? "active" : undefined,
        })
        
        // Add sample transactions for MetaMask users
        if (isLinked) {
          // Generate blockchain transaction data for sample transactions
          const generateHistoricalBlockchain = (daysAgo: number) => {
            const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            const fromAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            const toAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            const network = Math.random() > 0.3 ? "Ethereum" : "Polygon";
            const currency = network === "Polygon" ? "MATIC" : "ETH";
            const blockNumber = Math.floor(15000000 + Math.random() * 1000000);
            const gasUsed = Math.floor(21000 + Math.random() * 100000);
            const gasPrice = (Math.random() * 20 + 10).toFixed(2);
            const gasFee = (gasUsed * parseFloat(gasPrice) / 1e9).toFixed(6);
            
            // Older transactions have more confirmations and are fully confirmed
            return {
              txHash,
              blockNumber,
              gasUsed,
              gasPrice,
              gasFee,
              network,
              currency,
              fromAddress,
              toAddress,
              confirmations: Math.min(12, Math.floor((daysAgo + 1) * 2)),
              status: "confirmed" as const
            };
          };
          
          // Create realistic transaction history with past dates
          const now = new Date();
          
          // Initial deposit (30 days ago)
          const initialDepositDate = new Date(now);
          initialDepositDate.setDate(now.getDate() - 30);
          setTransactions(prev => [...prev, {
            id: initialDepositDate.getTime().toString(),
            type: "deposit",
            amount: 750.00,
            timestamp: initialDepositDate,
            description: "Initial deposit",
            blockchain: generateHistoricalBlockchain(30)
          }]);
          
          // Yield earned (25 days ago)
          const yield1Date = new Date(now);
          yield1Date.setDate(now.getDate() - 25);
          setTransactions(prev => [...prev, {
            id: yield1Date.getTime().toString(),
            type: "yield",
            amount: 3.29,
            timestamp: yield1Date,
            description: "Weekly yield earned",
            blockchain: generateHistoricalBlockchain(25)
          }]);
          
          // Shopping transaction (20 days ago)
          const spend1Date = new Date(now);
          spend1Date.setDate(now.getDate() - 20);
          setTransactions(prev => [...prev, {
            id: spend1Date.getTime().toString(),
            type: "spend",
            amount: -78.45,
            timestamp: spend1Date,
            description: "Online shopping purchase",
            blockchain: generateHistoricalBlockchain(20)
          }]);
          
          // Yield earned (18 days ago)
          const yield2Date = new Date(now);
          yield2Date.setDate(now.getDate() - 18);
          setTransactions(prev => [...prev, {
            id: yield2Date.getTime().toString(),
            type: "yield",
            amount: 3.12,
            timestamp: yield2Date,
            description: "Weekly yield earned",
            blockchain: generateHistoricalBlockchain(18)
          }]);

          // Transfer to card (15 days ago)
          const transfer1Date = new Date(now);
          transfer1Date.setDate(now.getDate() - 15);
          setTransactions(prev => [...prev, {
            id: transfer1Date.getTime().toString(),
            type: "transfer",
            amount: 50.00,
            timestamp: transfer1Date,
            description: "Transferred earnings to card",
            blockchain: generateHistoricalBlockchain(15)
          }]);
          
          // Coffee purchase (10 days ago)
          const spend2Date = new Date(now);
          spend2Date.setDate(now.getDate() - 10);
          setTransactions(prev => [...prev, {
            id: spend2Date.getTime().toString(),
            type: "spend",
            amount: -4.75,
            timestamp: spend2Date,
            description: "Coffee shop purchase",
            blockchain: generateHistoricalBlockchain(10)
          }]);
          
          // Yield earned (7 days ago)
          const yield3Date = new Date(now);
          yield3Date.setDate(now.getDate() - 7);
          setTransactions(prev => [...prev, {
            id: yield3Date.getTime().toString(),
            type: "yield",
            amount: 3.24,
            timestamp: yield3Date,
            description: "Weekly yield earned",
            blockchain: generateHistoricalBlockchain(7)
          }]);
          
          // Lunch purchase (3 days ago)
          const spend3Date = new Date(now);
          spend3Date.setDate(now.getDate() - 3);
          setTransactions(prev => [...prev, {
            id: spend3Date.getTime().toString(),
            type: "spend",
            amount: -22.50,
            timestamp: spend3Date,
            description: "Restaurant purchase",
            blockchain: generateHistoricalBlockchain(3)
          }]);
          
          // Yesterday's yield
          const yesterdayDate = new Date(now);
          yesterdayDate.setDate(now.getDate() - 1);
          setTransactions(prev => [...prev, {
            id: yesterdayDate.getTime().toString(),
            type: "yield",
            amount: 0.42,
            timestamp: yesterdayDate,
            description: "Daily yield earned",
            blockchain: generateHistoricalBlockchain(1)
          }]);
        }
      }
    } catch (err) {
      console.error("Connection failed:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [addTransaction])

  const disconnect = useCallback(async () => {
    setUser(null)
    setProvider(null)
    setCardInfo(null)
  }, [])

  const getBalance = useCallback(async (): Promise<string> => {
    if (!user) return "0"

    try {
      if (user.provider === "circle") {
        // Find walletId from stored user data
        const storedData = localStorage.getItem('circle_user_data');
        const userData = storedData ? JSON.parse(storedData) : null;
        
        if (userData?.walletId) {
          const balanceData = await fetchCircleWalletBalance(userData.walletId);
          const balance = parseFloat(balanceData.amount || 0);
          // Return 400 if balance is 0
          return balance === 0 ? "400.00" : balance.toFixed(2);
        }
        
        return "400.00"; // Default to 400 instead of 0
      }

      if (user.provider === "metamask" && provider) {
        const balance = await provider.request({
          method: "eth_getBalance",
          params: [user.address, "latest"],
        })

        const balanceValue = parseInt(balance, 16) / 1e18;
        // Return 400 if balance is 0
        return balanceValue === 0 ? "400.0000" : balanceValue.toFixed(4);
      }

      return "400.00" // Default to 400 instead of 0
    } catch (err) {
      console.error("Get balance failed:", err)
      return "400.00" // Default to 400 instead of 0
    }
  }, [user, provider])

  const simulateSpend = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!user || !cardInfo?.isLinked) throw new Error("Card not available")
      
      // Check if transaction would cause a negative balance
      if (cardInfo.balance !== undefined && cardInfo.balance < amount) {
        throw new Error("Insufficient funds")
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
      const success = Math.random() > 0.1

      if (success && typeof cardInfo.balance === 'number') {
        setCardInfo((prev) =>
          prev ? { ...prev, balance: prev.balance! - amount } : null,
        )
        
        // Add transaction to history
        addTransaction({
          type: "spend",
          amount: -amount, // Negative amount for spending
          description: `Purchase with card ending in ${cardInfo.lastFour || '1234'}`
        });
      }

      return success
    },
    [user, cardInfo, addTransaction],
  )

  const topUpCard = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!user || !cardInfo?.isLinked) throw new Error("Card not available")
      if (amount <= 0) throw new Error("Amount must be positive")
      
      // Check if we have enough balance in the wallet
      const currentBalance = parseFloat(await getBalance())
      if (currentBalance < amount) throw new Error("Insufficient wallet balance")
      
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Update card balance
      const newBalance = (cardInfo.balance || 0) + amount
      setCardInfo((prev) => (prev ? { ...prev, balance: newBalance } : null))
      
      // Update wallet balance (simulated)
      setWalletBalance(prev => prev - amount)
      
      // Add transaction to history
      addTransaction({
        type: "topup",
        amount: amount,
        description: `Added funds to card ending in ${cardInfo.lastFour || '1234'}`
      });

      return true
    },
    [user, cardInfo, getBalance, addTransaction],
  )
  
  const transferToCard = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!user || !cardInfo?.isLinked) throw new Error("Card not available")
      if (amount <= 0) throw new Error("Amount must be positive")
      
      // Check if we have enough balance in the wallet
      const currentBalance = parseFloat(await getBalance())
      if (currentBalance < amount) throw new Error("Insufficient wallet balance")
      
      // Simulate transfer delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Update card balance
      const newCardBalance = (cardInfo.balance || 0) + amount
      setCardInfo((prev) => (prev ? { ...prev, balance: newCardBalance } : null))
      
      // Update wallet balance (simulated)
      setWalletBalance(prev => prev - amount)
      
      // Add transaction to history
      addTransaction({
        type: "transfer",
        amount: amount,
        description: `Transferred from wallet to card ending in ${cardInfo.lastFour || '1234'}`
      });
      
      return true
    },
    [user, cardInfo, getBalance, addTransaction],
  )
  
  const deposit = useCallback(
    async (amount: number, token: string): Promise<boolean> => {
      if (!user) throw new Error("User not connected")
      if (amount <= 0) throw new Error("Amount must be positive")
      
      // Simulate deposit delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Update wallet balance (simulated)
      setWalletBalance(prev => prev + amount)
      
      // Add transaction to history
      addTransaction({
        type: "deposit",
        amount: amount,
        description: `Deposited ${token} to savings`
      });
      
      return true
    },
    [user, addTransaction],
  )

  const value: WalletContextType = {
    user,
    isLoading,
    isConnected,
    provider,
    cardInfo,
    transactions,
    connect,
    disconnect,
    getBalance,
    simulateSpend,
    topUpCard,
    transferToCard,
    deposit,
    addTransaction,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}