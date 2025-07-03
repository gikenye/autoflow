"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowRightIcon, AlertTriangle, CheckCircle } from "lucide-react"
import axios from "axios"

export function TopUpCardSection() {
  const { user, cardInfo } = useWallet()
  const [amount, setAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoTopUp, setAutoTopUp] = useState(false)

  // Reset state when transaction completes
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleTopUp = async () => {
    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // This would be a real API call in production
      // await axios.post("/api/transfer-to-metamask", {
      //   amount: transferAmount,
      //   sourceWallet: user?.address,
      //   destinationWallet: localStorage.getItem("metamask_address")
      // })
      
      // Mock API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success (with small chance of failure for testing)
      const isSuccessful = Math.random() > 0.1
      
      if (isSuccessful) {
        setSuccess(true)
        setAmount("")
      } else {
        throw new Error("Transfer failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Top-up failed:", err)
      setError(err.message || "Failed to transfer funds")
    } finally {
      setIsProcessing(false)
    }
  }

  // Check if user is connected and has linked a MetaMask wallet
  const isMetaMaskLinked = !!localStorage.getItem("metamask_linked")
  const metaMaskAddress = localStorage.getItem("metamask_address")

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top-Up MetaMask</CardTitle>
          <CardDescription>Transfer funds from Circle to MetaMask</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Please connect your wallet first.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!isMetaMaskLinked || !metaMaskAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top-Up MetaMask</CardTitle>
          <CardDescription>Transfer funds from Circle to MetaMask</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please link your MetaMask wallet as a spending wallet first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top-Up MetaMask</CardTitle>
        <CardDescription>Transfer funds from Circle to MetaMask</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USDC)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8"
              min="0"
              step="0.01"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-topup" className="cursor-pointer">Auto-top-up with daily yield</Label>
            <Switch
              id="auto-topup"
              checked={autoTopUp}
              onCheckedChange={setAutoTopUp}
            />
          </div>
          {autoTopUp && (
            <p className="text-xs text-gray-500">
              Your daily yield will be automatically transferred to your MetaMask wallet.
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Funds successfully transferred to MetaMask!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTopUp} 
          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Transfer...
            </>
          ) : (
            <>
              <ArrowRightIcon className="w-4 h-4 mr-2" />
              Transfer to MetaMask
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}