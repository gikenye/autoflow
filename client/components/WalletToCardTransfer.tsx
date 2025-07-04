"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, Loader2, AlertTriangle, CheckCircle, Wallet, CreditCard } from "lucide-react"

export function WalletToCardTransfer() {
  const { user, cardInfo, transferToCard, getBalance } = useWallet()
  const [amount, setAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<string>("0")

  // Fetch current wallet balance
  const updateBalance = async () => {
    if (user) {
      const balance = await getBalance()
      setWalletBalance(balance)
    }
  }

  // Update balance when component mounts
  useEffect(() => {
    updateBalance()
  }, [user])

  // Handle transfer
  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    // Check if amount exceeds wallet balance
    const currentBalance = parseFloat(walletBalance)
    if (transferAmount > currentBalance) {
      setError(`Insufficient funds. Your wallet balance is $${currentBalance}`)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await transferToCard(transferAmount)
      
      if (result) {
        setSuccess(true)
        setAmount("")
        // Update wallet balance after transfer
        updateBalance()
        setTimeout(() => setSuccess(false), 5000)
      } else {
        throw new Error("Transfer failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Transfer failed:", err)
      setError(err.message || "Failed to transfer funds to your card")
    } finally {
      setIsProcessing(false)
    }
  }

  // Check if user is connected
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRight className="w-5 h-5" />
            <span>Transfer to Card</span>
          </CardTitle>
          <CardDescription>Move funds from wallet to card</CardDescription>
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

  // Check if card is available
  if (!cardInfo?.isLinked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRight className="w-5 h-5" />
            <span>Transfer to Card</span>
          </CardTitle>
          <CardDescription>Move funds from wallet to card</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please set up your card first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const quickAmounts = [10, 25, 50, 100]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowRight className="w-5 h-5 text-blue-600" />
          <span>Transfer to Card</span>
        </CardTitle>
        <CardDescription>Move funds from wallet to card</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balances */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center space-x-2 mb-1">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Wallet Balance</span>
            </div>
            <p className="text-lg font-semibold text-green-700">${walletBalance}</p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-2 mb-1">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Card Balance</span>
            </div>
            <p className="text-lg font-semibold text-blue-700">${cardInfo.balance?.toFixed(2) || "0.00"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount to transfer</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8"
              min="1"
              max={walletBalance}
              step="0.01"
              disabled={isProcessing}
            />
          </div>
          <p className="text-xs text-gray-500">
            Available: ${walletBalance}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Quick amounts</Label>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={isProcessing || quickAmount > parseFloat(walletBalance)}
                className={`text-sm ${quickAmount > parseFloat(walletBalance) ? 'opacity-50' : ''}`}
              >
                ${quickAmount}
              </Button>
            ))}
          </div>
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
              Funds successfully transferred to your card!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTransfer} 
          disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(walletBalance)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Transfer ${parseFloat(amount || "0").toFixed(2)} to Card
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}