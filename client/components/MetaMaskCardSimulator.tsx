"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, Check, CreditCard } from "lucide-react"
import axios from "axios"

export function MetaMaskCardSimulator() {
  const { user: circleUser, addTransaction } = useWallet()
  const [cardWallet, setCardWallet] = useState<string | null>(null)
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we have a stored Card wallet
  useEffect(() => {
    const storedCardWallet = localStorage.getItem("metamask_card_wallet")
    if (storedCardWallet) {
      setCardWallet(storedCardWallet)
    }
  }, [])

  // Create Card wallet
  const handleCreateCard = async () => {
    if (!circleUser) return

    setIsCreatingCard(true)
    setError(null)

    try {
      // In a real app, you would pass the user ID from the authenticated session
      const userId = localStorage.getItem("circle_user_id") || "mock-user-id"
      
      const response = await axios.post("/api/metamask/create-metamask-card-wallet", {
        userId
      })
      
      if (response.data.success) {
        const { address } = response.data.data
        setCardWallet(address)
        localStorage.setItem("metamask_card_wallet", address)
        
        // Add transaction for card setup
        addTransaction({
          type: "topup",
          amount: 50.00, // Initial bonus for setting up card
          description: "Card setup bonus"
        });
      } else {
        throw new Error(response.data.error || "Failed to create your card")
      }
    } catch (err: any) {
      console.error("Failed to create card wallet:", err)
      setError(err.message || "Failed to create your card")
    } finally {
      setIsCreatingCard(false)
    }
  }

  // If no Circle user is connected, show a message
  if (!circleUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Setup Your Card</span>
          </CardTitle>
          <CardDescription>Create your spending card to use your earnings</CardDescription>
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

  // If Card wallet is already created
  if (cardWallet) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <span>Card Ready</span>
          </CardTitle>
          <CardDescription>Your spending card has been created and is ready to use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" /> Active
              </Badge>
              <span className="text-sm">
                Card ending in •••• 1234
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            You can now receive your savings earnings on this card and spend them anywhere.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Setup Your Card</span>
        </CardTitle>
        <CardDescription>Create your spending card to use your earnings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Your card lets you access and spend your savings earnings without affecting your principal investment.
        </p>
        
        <Button 
          onClick={handleCreateCard} 
          disabled={isCreatingCard}
          className="w-full"
        >
          {isCreatingCard ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Setting Up Card...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Create My Card
            </>
          )}
        </Button>

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