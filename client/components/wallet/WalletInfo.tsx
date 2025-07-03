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
import { Wallet, CreditCard, ExternalLink, LogOut, Copy, Check } from "lucide-react"

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
    <div className="flex items-center space-x-3">
      {/* Wallet Balance */}
      <Card className="border-green-200">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{balance} ETH</p>
              <p className="text-xs text-gray-500">Wallet Balance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Info */}
      {cardInfo?.isLinked && (
        <Card className="border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">${cardInfo.balance?.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Card Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name || user.address} />
              <AvatarFallback>
                {user.name ? user.name.charAt(0).toUpperCase() : user.address.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
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
                {user.provider === "metamask" ? "MetaMask" : "Circle"}
              </Badge>
            </div>
          </div>
          <DropdownMenuSeparator />

          {/* Card Status */}
          <div className="p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">MetaMask Card</span>
              {cardInfo?.isLinked ? (
                <Badge className="bg-green-100 text-green-800">Active •••• {cardInfo.lastFour}</Badge>
              ) : (
                <Badge variant="outline">Not Linked</Badge>
              )}
            </div>
            {!cardInfo?.isLinked && (
              <p className="text-xs text-muted-foreground mt-1">Visit MetaMask to apply for a card</p>
            )}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Visit MetaMask</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnect} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
