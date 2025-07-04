"use client"

import { useState } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, Loader2, AlertTriangle, CheckCircle, CreditCard } from "lucide-react"

export function CardTopUp() {
  const { user, cardInfo, topUpCard } = useWallet()
  const [amount, setAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle top up
  const handleTopUp = async () => {
    const topUpAmount = parseFloat(amount)
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // topUpCard already adds a transaction to history
      const result = await topUpCard(topUpAmount)
      
      if (result) {
        setSuccess(true)
        setAmount("")
        setTimeout(() => setSuccess(false), 5000)
      } else {
        throw new Error("Top-up failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Top-up failed:", err)
      setError(err.message || "Failed to add funds to your card")
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
            <PlusCircle className="w-5 h-5" />
            <span>Add Funds</span>
          </CardTitle>
          <CardDescription>Add money to your spending card</CardDescription>
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
            <PlusCircle className="w-5 h-5" />
            <span>Add Funds</span>
          </CardTitle>
          <CardDescription>Add money to your spending card</CardDescription>
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
          <PlusCircle className="w-5 h-5 text-green-600" />
          <span>Add Funds</span>
        </CardTitle>
        <CardDescription>Add money to your spending card</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cardInfo && (
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Card Balance: ${cardInfo.balance?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-gray-500">•••• {cardInfo.lastFour || "1234"}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Amount to add</Label>
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
              step="0.01"
              disabled={isProcessing}
            />
          </div>
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
                disabled={isProcessing}
                className="text-sm"
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
              Funds successfully added to your card!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTopUp} 
          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding Funds...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add ${parseFloat(amount || "0").toFixed(2)}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}