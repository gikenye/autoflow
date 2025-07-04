"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowRightIcon, AlertTriangle, CheckCircle, TrendingUp, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import axios from "axios"

export function TopUpCardSection() {
  const { user, cardInfo } = useWallet()
  const [amount, setAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoTransfer, setAutoTransfer] = useState(false)
  const [availableEarnings, setAvailableEarnings] = useState(12.50) // Simulated aUSDC earnings

  // Reset state when transaction completes
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleTransferEarnings = async () => {
    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (transferAmount > availableEarnings) {
      setError("Amount exceeds your available earnings")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success
      setSuccess(true)
      setAvailableEarnings(prev => parseFloat((prev - transferAmount).toFixed(2)))
      setAmount("")
    } catch (err: any) {
      console.error("Transfer failed:", err)
      setError(err.message || "Failed to transfer funds")
    } finally {
      setIsProcessing(false)
    }
  }

  // Check if user is connected
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Move Earnings to Card</CardTitle>
          <CardDescription>Transfer your savings earnings to your spending card</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>Earnings Available</span>
        </CardTitle>
        <CardDescription>Move your savings earnings to your spending card</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-800">Available to transfer</span>
              <Badge className="bg-green-100 text-green-800">
                5% APY
              </Badge>
            </div>
            <span className="font-medium text-green-800">${availableEarnings.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount to move to card</Label>
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
              max={availableEarnings}
              step="0.01"
              disabled={isProcessing}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Min: $0.01</span>
            <span>Max: ${availableEarnings.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-transfer" className="cursor-pointer">Auto-transfer daily earnings</Label>
            <Switch
              id="auto-transfer"
              checked={autoTransfer}
              onCheckedChange={setAutoTransfer}
            />
          </div>
          {autoTransfer && (
            <p className="text-xs text-gray-500">
              Your daily earnings will be automatically transferred to your card.
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
              Earnings successfully moved to your card!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTransferEarnings} 
          disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableEarnings}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Moving Funds...
            </>
          ) : (
            <>
              <ArrowRightIcon className="w-4 h-4 mr-2" />
              Move to Card
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}