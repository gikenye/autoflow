"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowRight, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function AaveEarnings() {
  const { user, cardInfo, addTransaction, topUpCard } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [principal, setPrincipal] = useState(789.23) // More realistic principal amount
  const [earnings, setEarnings] = useState(0)
  const [transferring, setTransferring] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simulate fetching aUSDC balance
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

  // Generate daily yield periodically
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

  const handleTransferToCard = async () => {
    if (!user || earnings <= 0) return;

    setTransferring(true);
    setError(null);
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use topUpCard function to add earnings to card balance
      const result = await topUpCard(earnings);
      
      if (result) {
        // Add transaction for transfer
        addTransaction({
          type: "transfer",
          amount: earnings,
          description: "Moved earnings to card"
        });
        
        // Show success message and reset earnings
        setSuccess(true);
        setEarnings(0);
      } else {
        throw new Error("Transfer failed");
      }
    } catch (err: any) {
      console.error('Transfer failed:', err);
      setError('Failed to transfer earnings to card');
    } finally {
      setTransferring(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>My Earnings</span>
          </CardTitle>
          <CardDescription>Track and use your savings earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Please connect your wallet to see your earnings</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>My Earnings</span>
        </CardTitle>
        <CardDescription>Track and use your savings earnings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-green-800">Available Earnings</span>
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
                <span className="text-xl font-semibold text-green-800">${earnings}</span>
              </div>
              <p className="text-sm text-green-800">
                Earned from ${principal.toLocaleString()} deposited in savings
              </p>
              <p className="text-xs text-green-700 mt-1">
                ~${(principal * 0.052 / 365).toFixed(2)} earned daily
              </p>
            </div>

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Earnings moved to card!
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
        <Button 
          onClick={handleTransferToCard} 
          disabled={transferring || isLoading || earnings <= 0}
          className="w-full"
          variant={earnings > 0 ? "default" : "outline"}
        >
          {transferring ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Moving to Card...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Send to Spending Card
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}