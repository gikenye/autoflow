"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Loader2, AlertTriangle, Check, CreditCard, Coffee, ShoppingBag, Utensils, Zap } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function AaveYieldSpender() {
  const { user, addTransaction } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [principal, setPrincipal] = useState(789.23) // Same as AaveEarnings component
  const [earnings, setEarnings] = useState(0)
  const [amount, setAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [spentItem, setSpentItem] = useState<string>("coffee")

  // Simulate fetching aUSDC balance - same as AaveEarnings
  useEffect(() => {
    if (user) {
      // Simulate API call delay
      const timer = setTimeout(() => {
        // More realistic calculations:
        // Formula: principal * APY / 365 * days
        // Assuming 5.2% APY (current Aave rate) and accumulated over 14 days
        const apy = 0.052;
        const days = 14;
        const simulatedEarnings = principal * apy / 365 * days;
        setEarnings(parseFloat(simulatedEarnings.toFixed(2)));
        setIsLoading(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [user, principal]);

  // Generate daily yield periodically - same as AaveEarnings
  useEffect(() => {
    if (user && !isLoading) {
      const dailyYieldInterval = setInterval(() => {
        // Daily yield at 5.2% APY
        const dailyYield = principal * 0.052 / 365;
        setEarnings(prev => parseFloat((prev + dailyYield).toFixed(2)));
        
        // Add transaction for yield earned
        addTransaction({
          type: "yield",
          amount: parseFloat(dailyYield.toFixed(2)),
          description: "Daily yield earned"
        });
      }, 60000); // Generate yield every minute for demo purposes
      
      return () => clearInterval(dailyYieldInterval);
    }
  }, [user, isLoading, principal, addTransaction]);

  // Reset success message after a delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const spendItems = [
    { id: "coffee", icon: <Coffee className="w-4 h-4" />, label: "Coffee", amount: "3.50" },
    { id: "food", icon: <Utensils className="w-4 h-4" />, label: "Lunch", amount: "12.00" },
    { id: "shopping", icon: <ShoppingBag className="w-4 h-4" />, label: "Shopping", amount: "25.00" },
  ]
  const handleQuickSpend = async (item: { id: string, amount: string, label: string }) => {
    if (!user) return;
    
    const spendAmount = parseFloat(item.amount);
    if (isNaN(spendAmount) || spendAmount <= 0) {
      setError("Invalid amount")
      return
    }
    
    // Check if we have enough earnings
    if (earnings < spendAmount) {
      setError("Insufficient yield earnings")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(false)
    setSpentItem(item.id)
    setAmount(item.amount)

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Deduct from earnings
      setEarnings(prev => parseFloat((prev - spendAmount).toFixed(2)))
      
      // Add transaction for direct yield spend
      addTransaction({
        type: "spend",
        amount: -spendAmount,
        description: `Direct yield spend: ${item.label}`
      })
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      console.error("Yield spend failed:", err)
      setError(err.message || "Purchase failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSpend = async () => {
    if (!user) return
    
    const spendAmount = parseFloat(amount)
    if (isNaN(spendAmount) || spendAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }
    
    // Check if we have enough earnings
    if (earnings < spendAmount) {
      setError("Insufficient yield earnings")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(false)
    setSpentItem("custom")

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Deduct from earnings
      setEarnings(prev => parseFloat((prev - spendAmount).toFixed(2)))
      
      // Add transaction for direct yield spend
      addTransaction({
        type: "spend",
        amount: -spendAmount,
        description: "Direct yield spend"
      })
      
      setSuccess(true)
      setAmount("")
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      console.error("Yield spend failed:", err)
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
            <Zap className="w-5 h-5 text-green-600" />
            <span>Spend Yield Directly</span>
          </CardTitle>
          <CardDescription>Use your earnings without transferring to card</CardDescription>
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

  const getSuccessMessage = () => {
    switch(spentItem) {
      case "coffee":
        return "Success! You just bought ☕️ with $3.50 directly from your yield earnings.";
      case "food":
        return "Yum! You just paid for lunch 🍱 with $12.00 directly from your yield earnings.";
      case "shopping":
        return "Nice! You just made a purchase 🛍️ with $25.00 directly from your yield earnings.";
      default:
        return `Purchase complete! You spent $${amount} directly from your yield earnings.`;
    }
  }

  return (
    <Card className="border-green-200 AaveYieldSpender">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-green-600" />
          <span>Spend Yield Directly</span>
        </CardTitle>
        <CardDescription>Use your earnings without transferring to card</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-green-800">Available Yield</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge className="bg-green-100 text-green-800">
                          5.2% APY
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Earnings from your USDC in Aave</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-xl font-semibold text-green-800">${earnings.toFixed(2)}</span>
              </div>
              <p className="text-xs text-green-700">
                ~${(principal * 0.052 / 365).toFixed(2)} earned daily
              </p>
            </div>

            <div className="pt-2">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Quick Purchase</h4>
                <div className="grid grid-cols-3 gap-2">
                  {spendItems.map((item) => (
                    <Button 
                      key={item.id}
                      variant="outline"
                      className="flex flex-col items-center justify-center h-20 p-2"
                      onClick={() => handleQuickSpend(item)}
                      disabled={isProcessing || earnings < parseFloat(item.amount)}
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
                      max={earnings}
                      step="0.01"
                      placeholder="0.00"
                      className="pl-7"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleSpend} 
                    disabled={isProcessing || !amount || parseFloat(amount) > earnings}
                    className="bg-green-600 hover:bg-green-700"
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
          </>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm text-gray-500">
          <p>Spend your yield earnings directly without transferring to your card first</p>
        </div>
      </CardFooter>
    </Card>
  )
} 