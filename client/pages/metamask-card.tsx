"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

interface MetaMaskCardProps {
  cardholderName?: string
  balance?: string
  walletAddress?: string
  expirationDate?: string
  lastFourDigits?: string
  onSpendClick?: () => void
  onDepositClick?: () => void
}

export default function MetaMaskCard({
  cardholderName = "AutoFlow User",
  balance = "1,234.56",
  walletAddress = "0x1234...5678",
  expirationDate = "12/26",
  lastFourDigits = "4623",
  onSpendClick,
  onDepositClick,
}: MetaMaskCardProps) {
  const [transactions] = useState([
    {
      id: 1,
      type: "deposit",
      title: "Deposit",
      time: "Today, 10:45 AM",
      amount: "+ $500.00",
      color: "green",
    },
    {
      id: 2,
      type: "spend",
      title: "Yield Spend",
      time: "Yesterday, 3:12 PM",
      amount: "- $24.89",
      color: "red",
    },
  ])

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Card */}
      <div className="relative w-full aspect-[1.586] max-w-md rounded-t-xl overflow-hidden">
        {/* Card background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#013330] via-[#F76B1C] to-[#013330]">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),rgba(0,0,0,0.2))]"></div>
        </div>

        {/* Card content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <img alt="MetaMask Fox" className="h-6 w-auto" src="/metamask-fox.svg" />
              <span className="font-bold text-base tracking-tight">MetaMask</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              Virtual
            </span>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium opacity-80">Current Balance</div>
              <div className="text-xl font-bold">{balance} USDC</div>
              <div className="text-xs opacity-70">Connected to {walletAddress}</div>
            </div>

            <div className="text-base font-mono tracking-[0.2em] opacity-90">•••• •••• •••• {lastFourDigits}</div>

            <div className="flex items-end justify-between">
              <div className="text-left">
                <div className="text-xs uppercase opacity-70">Cardholder</div>
                <div className="text-sm font-semibold">{cardholderName}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase opacity-70">Valid Thru</div>
                <div className="text-sm font-semibold">{expirationDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={onSpendClick}
          className="flex-1 flex items-center justify-center py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#FF3C00] text-white font-medium text-sm hover:brightness-110 transition"
        >
          Spend Yield
        </button>
        <button
          onClick={onDepositClick}
          className="flex-1 flex items-center justify-center py-2.5 bg-[#2A2A2D] text-white font-medium text-sm hover:bg-[#3A3A3D] transition"
        >
          Add Funds
        </button>
      </div>
    </div>
  )
}
