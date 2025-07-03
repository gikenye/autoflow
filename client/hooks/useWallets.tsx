"use client"

import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react"
import axios from "axios"

export interface User {
  address: string
  email?: string
  name?: string
  profileImage?: string
  provider: "circle" | "metamask"
}

export interface CardInfo {
  isLinked: boolean
  balance?: number
  limit?: number
  lastFour?: string
  status?: "active" | "pending" | "blocked"
}

export interface WalletContextType {
  user: User | null
  isLoading: boolean
  isConnected: boolean
  provider: any
  cardInfo: CardInfo | null
  connect: (method: "circle" | "metamask", userData?: any) => Promise<void>
  disconnect: () => Promise<void>
  getBalance: () => Promise<string>
  simulateSpend: (amount: number) => Promise<boolean>
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

  const isConnected = !!user

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

          // Mock card info for Circle users
          setCardInfo({
            isLinked: true,
            balance: 2000.00,
            limit: 5000,
            lastFour: "9876",
            status: "active",
          })
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
            balance: 2000,
            limit: 5000,
            lastFour: "9876",
            status: "active",
          })
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
          balance: isLinked ? 2847.32 : undefined,
          limit: isLinked ? 10000 : undefined,
          lastFour: isLinked ? "1234" : undefined,
          status: isLinked ? "active" : undefined,
        })
      }
    } catch (err) {
      console.error("Connection failed:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    setUser(null)
    setProvider(null)
    setCardInfo(null)
  }, [])

  const getBalance = useCallback(async (): Promise<string> => {
    if (!user) return "0"

    try {
      if (user.provider === "circle") {
        const res = await axios.get(`/api/circle/balance?address=${user.address}`)
        return res.data.balance.toFixed(2)
      }

      if (user.provider === "metamask" && provider) {
        const balance = await provider.request({
          method: "eth_getBalance",
          params: [user.address, "latest"],
        })

        return (parseInt(balance, 16) / 1e18).toFixed(4)
      }

      return "0"
    } catch (err) {
      console.error("Get balance failed:", err)
      return "0"
    }
  }, [user, provider])

  const simulateSpend = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!user || !cardInfo?.isLinked) throw new Error("Card not available")

      await new Promise((resolve) => setTimeout(resolve, 2000))
      const success = Math.random() > 0.1

      if (success && typeof cardInfo.balance === 'number') {
        setCardInfo((prev) =>
          prev ? { ...prev, balance: prev.balance! - amount } : null,
        )
      }

      return success
    },
    [user, cardInfo],
  )

  const value: WalletContextType = {
    user,
    isLoading,
    isConnected,
    provider,
    cardInfo,
    connect,
    disconnect,
    getBalance,
    simulateSpend,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}