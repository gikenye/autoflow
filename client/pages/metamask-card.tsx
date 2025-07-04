"use client"

import { useState } from "react"
import { WalletProvider } from "@/hooks/useWallets"
import { MetaMaskCardConnector } from "@/components/MetaMaskCardConnector"
import { MetaMaskCardSimulator } from "@/components/MetaMaskCardSimulator"
import { TopUpCardSection } from "@/components/TopUpCardSection"
import { CardSpendSimulator } from "@/components/CardSpendSimulator"
import { AaveEarnings } from "@/components/AaveEarnings"
import { CardTopUp } from "@/components/CardTopUp"
import { WalletInfo } from "@/components/wallet/WalletInfo"
import { TransactionLog } from "@/components/TransactionLog"
import { AaveYieldSpender } from "@/components/AaveYieldSpender"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SpendingCardPage() {
  const [activeTab, setActiveTab] = useState("connect")

  return (
    <WalletProvider>
      <div className="container mx-auto py-2 sm:py-4 px-3 sm:px-4">
        <div className="flex justify-between items-center mb-3 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Your Spending Card</h1>
            <p className="text-xs sm:text-sm text-gray-500">Setup and use your card</p>
          </div>
          <WalletInfo />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-3 sm:mb-6 w-full">
            <TabsTrigger value="connect" className="text-xs sm:text-sm">1. Setup</TabsTrigger>
            <TabsTrigger value="topup" className="text-xs sm:text-sm">2. Add Money</TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs sm:text-sm">3. Move Earnings</TabsTrigger>
            <TabsTrigger value="direct" className="text-xs sm:text-sm">4. Direct Spend</TabsTrigger>
            <TabsTrigger value="spend" className="text-xs sm:text-sm">5. Use Card</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4 sm:space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-8">
              <MetaMaskCardSimulator />
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("topup")}>Next: Add Money</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="topup" className="space-y-4 sm:space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-8">
              <CardTopUp />
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("earnings")}>Next: Move Earnings</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <AaveEarnings />
              <TopUpCardSection />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("direct")}>Next: Direct Spend</Button>
            </div>
          </TabsContent>

          <TabsContent value="direct" className="space-y-4 sm:space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-8">
              <AaveYieldSpender />
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("spend")}>Next: Use Card</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spend" className="space-y-4 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <CardSpendSimulator />
              <div className="flex justify-end col-span-1 md:col-span-2">
                <Button onClick={() => setActiveTab("history")}>View Activity</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4 sm:space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-8">
              <TransactionLog />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </WalletProvider>
  )
} 