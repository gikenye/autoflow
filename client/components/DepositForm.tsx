"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Info, TrendingUp, Loader2 } from "lucide-react"

interface DepositFormProps {
  onDeposit?: (amount: number, token: string) => Promise<void>
  isLoading?: boolean
  minDeposit?: number
  maxDeposit?: number
}

export function DepositForm({ 
  onDeposit, 
  isLoading = false, 
  minDeposit = 10, 
  maxDeposit = 100000 
}: DepositFormProps) {
  const [amount, setAmount] = useState<string>("")
  const [selectedToken, setSelectedToken] = useState("usdc")
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const tokens = [
    { 
      value: "usdc", 
      label: "USDC", 
      apy: 5.2, 
      description: "USD Coin - Stable, reliable yield",
      icon: "💵"
    },
    { 
      value: "dai", 
      label: "DAI", 
      apy: 5.0, 
      description: "Decentralized stablecoin",
      icon: "🏛️"
    },
    { 
      value: "eth", 
      label: "ETH", 
      apy: 4.8, 
      description: "Ethereum - Higher risk, variable returns",
      icon: "⟠"
    }
  ]

  const selectedTokenData = tokens.find(t => t.value === selectedToken) || tokens[0]
  const depositAmount = parseFloat(amount) || 0

  const calculateProjections = (amount: number, apy: number) => {
    const dailyRate = apy / 365 / 100
    const weeklyRate = apy / 52 / 100
    const monthlyRate = apy / 12 / 100
    
    return {
      daily: amount * dailyRate,
      weekly: amount * weeklyRate,
      monthly: amount * monthlyRate,
      annual: amount * apy / 100
    }
  }

  const projections = calculateProjections(depositAmount, selectedTokenData.apy)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!amount || isNaN(depositAmount)) {
      setError("Please enter a valid amount")
      return
    }

    if (depositAmount < minDeposit) {
      setError(`Minimum deposit is $${minDeposit}`)
      return
    }

    if (depositAmount > maxDeposit) {
      setError(`Maximum deposit is $${maxDeposit.toLocaleString()}`)
      return
    }

    setIsProcessing(true)

    try {
      if (onDeposit) {
        await onDeposit(depositAmount, selectedToken)
        setAmount("")
        setError(null)
      } else {
        // Mock deposit process
        await new Promise(resolve => setTimeout(resolve, 2000))
        setAmount("")
        setError(null)
      }
    } catch (error: any) {
      setError(error.message || "Deposit failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const quickAmounts = [100, 500, 1000, 5000]

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5 text-green-600" />
          <span>Deposit Assets</span>
        </CardTitle>
        <CardDescription>
          Add crypto to start earning yield automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label htmlFor="token">Select Asset</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue placeholder="Choose asset" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.value} value={token.value}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <span>{token.icon}</span>
                        <span>{token.label}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 ml-2">
                        {token.apy}% APY
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">{selectedTokenData.description}</p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg"
                min={minDeposit}
                max={maxDeposit}
                step="0.01"
                disabled={isProcessing}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Min: ${minDeposit}</span>
              <span>Max: ${maxDeposit.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
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

          {/* Yield Projections */}
          {depositAmount > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800">Projected Earnings</h4>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Estimates based on current APY. Actual returns may vary.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily yield:</span>
                  <span className="font-medium text-green-600">
                    ${projections.daily.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekly yield:</span>
                  <span className="font-medium text-green-600">
                    ${projections.weekly.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly yield:</span>
                  <span className="font-medium text-green-600">
                    ${projections.monthly.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual yield:</span>
                  <span className="font-medium text-green-600">
                    ${projections.annual.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-600">
                  💡 Deposits are routed to yield strategies like Aave for maximum returns
                </p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Deposit Button */}
          <Button
            type="submit"
            disabled={isProcessing || !amount || isNaN(depositAmount) || depositAmount < minDeposit}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Deposit...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Deposit ${depositAmount.toFixed(2)} {selectedTokenData.label}
              </>
            )}
          </Button>

          {/* Additional Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">How it works:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Your funds are deposited into secure DeFi protocols</li>
              <li>✓ Earn yield automatically while maintaining liquidity</li>
              <li>✓ Use earned yield for spending or access safe credit lines</li>
              <li>✓ Withdraw anytime with no lock-up periods</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 