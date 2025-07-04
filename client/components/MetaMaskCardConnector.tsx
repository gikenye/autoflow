"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import { useMetaMaskWallet } from "@/hooks/useMetaMaskWallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wallet, LinkIcon, AlertTriangle, ExternalLink, Check, CreditCard } from "lucide-react"
import axios from "axios"

export function MetaMaskCardConnector() {
  const { user: circleUser, cardInfo } = useWallet()
  const { connect: connectMetaMask, isLoading: isMetaMaskLoading } = useMetaMaskWallet()
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)
  const [linkSuccess, setLinkSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metamaskCardWallet, setMetamaskCardWallet] = useState<string | null>(null)
  const [isCreatingCard, setIsCreatingCard] = useState(false)

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum !== undefined

  // Check if we have a stored MetaMask address or card wallet
  useEffect(() => {
    const storedAddress = localStorage.getItem("metamask_address")
    const storedCardWallet = localStorage.getItem("metamask_card_wallet")
    
    if (storedAddress) {
      setMetaMaskAddress(storedAddress)
    }
    
    if (storedCardWallet) {
      setMetamaskCardWallet(storedCardWallet)
      setLinkSuccess(true)
    }
  }, [])

  // Connect MetaMask wallet
  const handleConnectMetaMask = async () => {
    try {
      setError(null)
      const { user } = await connectMetaMask()
      setMetaMaskAddress(user.address)
      localStorage.setItem("metamask_address", user.address)
    } catch (err: any) {
      console.error("MetaMask connection failed:", err)
      setError(err.message || "Failed to connect MetaMask")
    }
  }

  // Create MetaMask Card wallet (second Circle wallet)
  const handleCreateMetaMaskCard = async () => {
    if (!circleUser) return

    setIsCreatingCard(true)
    setError(null)

    try {
      const response = await axios.post("/api/create-metamask-card-wallet")
      
      if (response.data.success) {
        const { address } = response.data.data
        setMetamaskCardWallet(address)
        localStorage.setItem("metamask_card_wallet", address)
        setLinkSuccess(true)
      } else {
        throw new Error(response.data.error || "Failed to create MetaMask Card wallet")
      }
    } catch (err: any) {
      console.error("Failed to create MetaMask Card wallet:", err)
      setError(err.message || "Failed to create MetaMask Card wallet")
    } finally {
      setIsCreatingCard(false)
    }
  }

  // If no Circle user is connected, show a message
  if (!circleUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Get MetaMask Card</span>
          </CardTitle>
          <CardDescription>Create a MetaMask Card wallet powered by Circle</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Please connect your Circle wallet first.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // If MetaMask Card wallet is already created
  if (linkSuccess || metamaskCardWallet) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <span>MetaMask Card Created</span>
          </CardTitle>
          <CardDescription>Your MetaMask Card wallet has been created successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" /> Active
              </Badge>
              <span className="text-sm font-mono">
                {metamaskCardWallet ? `${metamaskCardWallet.slice(0, 6)}...${metamaskCardWallet.slice(-4)}` : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Get MetaMask Card</span>
        </CardTitle>
        <CardDescription>Create a MetaMask Card wallet powered by Circle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleCreateMetaMaskCard} 
          disabled={isCreatingCard}
          className="w-full"
        >
          {isCreatingCard ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Card Wallet...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Get MetaMask Card
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}