"use client"

import { useState } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Check, CreditCard, Coffee, ShoppingBag, Utensils } from "lucide-react"

export function CardSpendSimulator() {
  const { user, cardInfo, simulateSpend } = useWallet()
  const [amount, setAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [spentItem, setSpentItem] = useState<string>("coffee")

  const metamaskCardWallet = localStorage.getItem("metamask_card_wallet")
  const isCardAvailable = cardInfo?.isLinked || !!metamaskCardWallet
  
  // Ensure we always display a non-negative balance
  const cardBalance = cardInfo?.balance !== undefined ? 
    Math.max(0, cardInfo.balance) : 25.00

  const spendItems = [
    { id: "coffee", icon: <Coffee className="w-4 h-4" />, label: "Coffee", amount: "3.50" },
    { id: "food", icon: <Utensils className="w-4 h-4" />, label: "Lunch", amount: "12.00" },
    { id: "shopping", icon: <ShoppingBag className="w-4 h-4" />, label: "Shopping", amount: "25.00" },
  ]

  const handleQuickSpend = async (item: { id: string, amount: string }) => {
    if (!user || !isCardAvailable) return
    
    const spendAmount = parseFloat(item.amount)
    if (isNaN(spendAmount) || spendAmount <= 0) {
      setError("Invalid amount")
      return
    }
    
    // Check if we have enough balance
    if (cardBalance < spendAmount) {
      setError("Insufficient funds")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(false)
    setSpentItem(item.id)
    setAmount(item.amount)

    try {
      const result = await simulateSpend(spendAmount)
      if (result) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError("Purchase failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Spend simulation failed:", err)
      setError(err.message || "Purchase failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSpend = async () => {
    if (!user || !isCardAvailable) return
    
    const spendAmount = parseFloat(amount)
    if (isNaN(spendAmount) || spendAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }
    
    // Check if we have enough balance
    if (cardBalance < spendAmount) {
      setError("Insufficient funds")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(false)
    setSpentItem("custom")

    try {
      const result = await simulateSpend(spendAmount)
      if (result) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError("Purchase failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Spend simulation failed:", err)
      setError(err.message || "Purchase failed")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Your Card</span>
          </CardTitle>
          <CardDescription>Shop and pay with your card earnings</CardDescription>
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

  if (!isCardAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Your Card</span>
          </CardTitle>
          <CardDescription>Shop and pay with your card earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need to set up your card first. Go to the Setup tab.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const getSuccessMessage = () => {
    switch(spentItem) {
      case "coffee":
        return "Success! You just bought ☕️ with $3.50 from your card earnings.";
      case "food":
        return "Yum! You just paid for lunch 🍱 with $12.00 from your card earnings.";
      case "shopping":
        return "Nice! You just made a purchase 🛍️ with $25.00 from your card earnings.";
      default:
        return `Purchase complete! You spent $${amount} from your card earnings.`;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Your Card</span>
        </CardTitle>
        <CardDescription>Shop and pay with your card earnings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Available Balance</span>
            <span className="font-medium">${cardBalance.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Card Number</span>
            <span className="font-mono text-sm">•••• •••• •••• {cardInfo?.lastFour || "1234"}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Quick Purchase</h4>
            <div className="grid grid-cols-3 gap-2">
              {spendItems.map((item) => (
                <Button 
                  key={item.id}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 p-2"
                  onClick={() => handleQuickSpend(item)}
                  disabled={isProcessing || cardBalance < parseFloat(item.amount)}
                >
                  <div className="mb-1">{item.icon}</div>
                  <span className="text-xs">{item.label}</span>
                  <span className="text-sm font-medium">${item.amount}</span>
                </Button>
              ))}
            </div>
            
            <h4 className="text-sm font-medium mt-4">Custom Amount</h4>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  max={cardBalance}
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSpend} 
                disabled={isProcessing || !amount || parseFloat(amount) > cardBalance}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : "Pay Now"}
              </Button>
            </div>
          </div>
        </div>

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>
              {getSuccessMessage()}
            </AlertDescription>
          </Alert>
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
