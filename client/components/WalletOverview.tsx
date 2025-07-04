"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Wallet, TrendingUp, CreditCard, Copy, Check, Eye, EyeOff } from "lucide-react"

interface WalletOverviewProps {
  walletAddress?: string
  balance?: number
  yieldEarned?: number
  creditLimit?: number
  creditUsed?: number
  healthFactor?: number
  isLoading?: boolean
}

export function WalletOverview({
  walletAddress = "0x1234...5678",
  balance = 847.32,
  yieldEarned = 1.38,
  creditLimit = 423.66,
  creditUsed = 0,
  healthFactor = 85,
  isLoading = false
}: WalletOverviewProps) {
  const [copied, setCopied] = useState(false)
  const [showBalance, setShowBalance] = useState(true)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const creditAvailable = creditLimit - creditUsed

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Address */}
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardDescription>Your Wallet</CardDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-green-600" />
              <span className="font-mono text-sm">{formatAddress(walletAddress)}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={copyAddress}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* USDC Balance */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>USDC Balance</CardDescription>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
            <CardTitle className="text-2xl text-green-700">
              {showBalance ? `$${balance.toLocaleString()}` : "••••••"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-sm text-gray-600">
                Earned today: <span className="text-green-600 font-medium">+${yieldEarned}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credit Available */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardDescription>Credit Available</CardDescription>
            <CardTitle className="text-2xl text-blue-700">
              ${creditAvailable.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Safe to spend: <span className="font-medium">${Math.floor(creditAvailable * 0.1)}</span>
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Used</span>
                <span>{((creditUsed / creditLimit) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(creditUsed / creditLimit) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Health Factor */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardDescription>Health Score</CardDescription>
            <CardTitle className="text-2xl text-green-700">{healthFactor}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={healthFactor} className="h-2 mb-2" />
            <div className="flex items-center space-x-2">
              <Badge 
                className={
                  healthFactor >= 80 
                    ? "bg-green-100 text-green-800" 
                    : healthFactor >= 60 
                    ? "bg-yellow-100 text-yellow-800" 
                    : "bg-red-100 text-red-800"
                }
              >
                {healthFactor >= 80 ? "Excellent" : healthFactor >= 60 ? "Good" : "Caution"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${(balance * 0.052 / 365).toFixed(2)}</p>
              <p className="text-sm text-gray-600">Daily Yield</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">${(balance * 0.052 / 52).toFixed(2)}</p>
              <p className="text-sm text-gray-600">Weekly Yield</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">5.2%</p>
              <p className="text-sm text-gray-600">Annual APY</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">${(balance * 0.5).toFixed(0)}</p>
              <p className="text-sm text-gray-600">Max Credit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 