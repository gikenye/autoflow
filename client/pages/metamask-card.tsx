"use client"

import { useState } from "react"
import { WalletProvider } from "@/hooks/useWallets"
import { MetaMaskCardConnector } from "@/components/MetaMaskCardConnector"
import { TopUpCardSection } from "@/components/TopUpCardSection"
import { CardSpendSimulator } from "@/components/CardSpendSimulator"
import { WalletInfo } from "@/components/wallet/WalletInfo"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MetaMaskCardPage() {
  const [activeTab, setActiveTab] = useState("connect")

  return (
    <WalletProvider>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">MetaMask Card</h1>
            <p className="text-gray-500">Link and manage your MetaMask Card</p>
          </div>
          <WalletInfo />
        </div>

        <Tabs defaultValue="connect" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="topup">Top-Up</TabsTrigger>
            <TabsTrigger value="spend">Spend</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <MetaMaskCardConnector />
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("topup")}>Continue to Top-Up</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="topup" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <TopUpCardSection />
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("spend")}>Continue to Spend</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spend" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <CardSpendSimulator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </WalletProvider>
  )
} 