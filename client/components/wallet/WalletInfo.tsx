"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, CreditCard, LogOut, Copy, Check } from "lucide-react"

export function WalletInfo() {
  const { user, cardInfo, disconnect, getBalance } = useWallet()
  const [balance, setBalance] = useState<string>("0")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      getBalance().then(setBalance)
    }
  }, [user, getBalance])

  const copyAddress = async () => {
    if (user?.address) {
      await navigator.clipboard.writeText(user.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!user) return null

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      {/* Compact Balance Indicators (both mobile and desktop) */}
      <div className="flex items-center">
        {/* Wallet Balance - Minimal Style */}
        <div className="flex items-center text-xs bg-green-50 border border-green-100 rounded-full px-1.5 py-0.5 mr-1">
          <Wallet className="w-2.5 h-2.5 text-green-600 mr-0.5" />
          <span className="font-medium">${balance}</span>
        </div>
        
        {/* Card Balance - Minimal Style */}
        {cardInfo?.isLinked && (
          <div className="flex items-center text-xs bg-blue-50 border border-blue-100 rounded-full px-1.5 py-0.5">
            <CreditCard className="w-2.5 h-2.5 text-blue-600 mr-0.5" />
            <span className="font-medium">${cardInfo.balance?.toFixed(2) || "0"}</span>
          </div>
        )}
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name || user.address} />
              <AvatarFallback className="text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : user.address.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 sm:w-80" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.name && <p className="font-medium">{user.name}</p>}
              {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground">{formatAddress(user.address)}</p>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyAddress}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <Badge variant="outline" className="w-fit">
                {user.provider === "metamask" ? "Connected" : "Circle"}
              </Badge>
            </div>
          </div>
          <DropdownMenuSeparator />

          {/* Detailed Balances */}
          <div className="p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">My Balance</span>
              <span className="text-xs font-medium">${balance}</span>
            </div>
            {cardInfo?.isLinked && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs">Card Balance</span>
                <span className="text-xs font-medium">${cardInfo.balance?.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <DropdownMenuSeparator />

          {/* Card Status */}
          <div className="p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Spending Card</span>
              {cardInfo?.isLinked || localStorage.getItem("metamask_card_wallet") ? (
                <Badge className="bg-green-100 text-green-800">Active •••• {cardInfo?.lastFour || '1234'}</Badge>
              ) : (
                <Badge variant="outline">Not Setup</Badge>
              )}
            </div>
            {!cardInfo?.isLinked && !localStorage.getItem("metamask_card_wallet") && (
              <p className="text-xs text-muted-foreground mt-1">Set up your card to spend your earnings</p>
            )}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
