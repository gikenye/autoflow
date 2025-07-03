"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import { useMetaMaskWallet } from "@/hooks/useMetaMaskWallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wallet, LinkIcon, AlertTriangle, ExternalLink, Check } from "lucide-react"
import axios from "axios"

export function MetaMaskCardConnector() {
  const { user: circleUser, cardInfo } = useWallet()
  const { connect: connectMetaMask, isLoading: isMetaMaskLoading } = useMetaMaskWallet()
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)
  const [linkSuccess, setLinkSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum !== undefined

  // Check if we have a stored MetaMask address
  useEffect(() => {
    const storedAddress = localStorage.getItem("metamask_address")
    if (storedAddress) {
      setMetaMaskAddress(storedAddress)
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

  // Link MetaMask as spending wallet
  const handleLinkWallet = async () => {
    if (!circleUser || !metaMaskAddress) return

    setIsLinking(true)
    setError(null)

    try {
      // This would be a real API call in production
      // await axios.post("/api/link-spending-wallet", {
      //   circleUserId: circleUser.address,
      //   metaMaskAddress
      // })
      
      // Mock API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setLinkSuccess(true)
      
      // Store the linked status
      localStorage.setItem("metamask_linked", "true")
    } catch (err: any) {
      console.error("Failed to link wallet:", err)
      setError(err.message || "Failed to link wallet")
    } finally {
      setIsLinking(false)
    }
  }

  // If no Circle user is connected, show a message
  if (!circleUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Connect MetaMask Card</span>
          </CardTitle>
          <CardDescription>Link your MetaMask wallet as a spending wallet</CardDescription>
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

  // If MetaMask is not installed
  if (!isMetaMaskInstalled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>MetaMask Not Detected</span>
          </CardTitle>
          <CardDescription>Install MetaMask to enable card spending</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              MetaMask extension is not installed. You need MetaMask to link a spending wallet.
            </AlertDescription>
          </Alert>
          <Button asChild>
            <a 
              href="https://metamask.io/download.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Install MetaMask
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // If already linked successfully
  if (linkSuccess || (cardInfo?.isLinked && metaMaskAddress)) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-green-600" />
            <span>MetaMask Connected</span>
          </CardTitle>
          <CardDescription>Your MetaMask wallet is linked as a spending wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" /> Linked
              </Badge>
              <span className="text-sm font-mono">
                {metaMaskAddress ? `${metaMaskAddress.slice(0, 6)}...${metaMaskAddress.slice(-4)}` : ''}
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
          <Wallet className="w-5 h-5" />
          <span>Connect MetaMask Card</span>
        </CardTitle>
        <CardDescription>Link your MetaMask wallet as a spending wallet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!metaMaskAddress ? (
          <Button 
            onClick={handleConnectMetaMask} 
            disabled={isMetaMaskLoading}
            className="w-full"
          >
            {isMetaMaskLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">MetaMask Address</p>
              <p className="font-mono text-xs">
                {metaMaskAddress}
              </p>
            </div>
            
            <Button 
              onClick={handleLinkWallet} 
              disabled={isLinking}
              className="w-full"
            >
              {isLinking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Linking Wallets...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Set as Spending Wallet
                </>
              )}
            </Button>
          </div>
        )}

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