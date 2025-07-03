"use client"

import { useState } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

let confetti: any
if (typeof window !== "undefined") {
  confetti = require("canvas-confetti")
}

export function CardSpendSimulator() {
  const { user, cardInfo, simulateSpend } = useWallet()
  const [amount, setAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<{
    amount: number
    success: boolean
    timestamp: Date
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSpend = async () => {
    const spendAmount = parseFloat(amount)
    if (isNaN(spendAmount) || spendAmount <= 0) {
      setError("Please enter a valid amount")
      setIsProcessing(false)
      return
    }

    if (!cardInfo?.balance || spendAmount > cardInfo.balance) {
      setError("Insufficient balance")
      setIsProcessing(false)
      return
    }

    if (!cardInfo?.isLinked) {
      return
    }

    setIsProcessing(true)

    try {
      const success = await simulateSpend(spendAmount)

      setLastTransaction({
        amount: spendAmount,
        success,
        timestamp: new Date(),
      })

      if (success && confetti) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
        setAmount("")
      }
    } catch (error) {
      console.error("Spend simulation failed:", error)
      setLastTransaction({
        amount: spendAmount,
        success: false,
        timestamp: new Date(),
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Card Spending</span>
          </CardTitle>
          <CardDescription>Connect your wallet to simulate card spending</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Please connect your wallet to access card spending features.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!cardInfo?.isLinked) {
    return (
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>MetaMask Card</span>
          </CardTitle>
          <CardDescription>Link your MetaMask Card to enable spending</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No MetaMask Card detected. Visit{" "}
              <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline">
                MetaMask
              </a>{" "}
              to apply for a card and link it to your wallet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const spendAmount = parseFloat(amount) || 0
  const isValidAmount = spendAmount > 0 && spendAmount <= (cardInfo.balance || 0)

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <span>Card Spending</span>
          </div>
          <Badge className="bg-green-100 text-green-800">•••• {cardInfo.lastFour}</Badge>
        </CardTitle>
        <CardDescription>
          Available balance: ${cardInfo.balance?.toFixed(2)} | Limit: ${cardInfo.limit?.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="spend-amount">Spend Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="spend-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8"
              min="0"
              max={cardInfo.balance}
              step="0.01"
            />
          </div>
          {spendAmount > 0 && !isValidAmount && (
            <p className="text-sm text-red-600">Amount exceeds available balance (${cardInfo.balance?.toFixed(2)})</p>
          )}
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex space-x-2">
          {[10, 25, 50, 100].map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              size="sm"
              onClick={() => setAmount(quickAmount.toString())}
              disabled={quickAmount > (cardInfo.balance || 0)}
              className="flex-1"
            >
              ${quickAmount}
            </Button>
          ))}
        </div>

        {/* Spend Button */}
        <Button
          onClick={handleSpend}
          disabled={!isValidAmount || isProcessing}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Transaction...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Spend ${spendAmount.toFixed(2)}
            </>
          )}
        </Button>

        {/* Transaction Result */}
        {lastTransaction && (
          <Alert className={lastTransaction.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center space-x-2">
              {lastTransaction.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {lastTransaction.success ? (
                  <>
                    <strong>Transaction Successful!</strong> Spent ${lastTransaction.amount.toFixed(2)} via MetaMask
                    Card
                  </>
                ) : (
                  <>
                    <strong>Transaction Failed.</strong> Unable to process ${lastTransaction.amount.toFixed(2)} payment
                  </>
                )}
              </AlertDescription>
            </div>
            <p className="text-xs text-gray-500 mt-1">{lastTransaction.timestamp.toLocaleTimeString()}</p>
          </Alert>
        )}

        {/* Card Status */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Card Status:</span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {cardInfo.status?.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Available Credit:</span>
            <span className="font-medium">${((cardInfo.limit || 0) - (cardInfo.balance || 0)).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
