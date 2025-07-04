"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import type { Transaction } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TransactionReceipt } from "@/components/TransactionReceipt"
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  ArrowRight, 
  Calendar,
  RefreshCw,
  Zap,
  ExternalLink
} from "lucide-react"
import { format, formatDistance } from "date-fns"

export function TransactionLog() {
  const { transactions, user } = useWallet()
  const [displayLimit, setDisplayLimit] = useState(10)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  // Update current time every second to make transactions appear real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Refresh the component every 10 seconds to update relative times
      if (currentTime.getSeconds() % 10 === 0) {
        setRefreshKey(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentTime]);

  // Force refresh the component when new transactions are added
  useEffect(() => {
    if (transactions.length > 0) {
      setRefreshKey(prev => prev + 1);
    }
  }, [transactions.length]);

  // Handle transaction click to view receipt
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setReceiptOpen(true);
  };

  // If no user is connected, show a message
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Transaction History</span>
          </CardTitle>
          <CardDescription>Your recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Please connect your wallet to see transaction history.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // If no transactions yet
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Transaction History</span>
          </CardTitle>
          <CardDescription>Your recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-gray-600">No transactions yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Helper to get the appropriate icon for transaction type
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <Plus className="w-4 h-4 text-green-600" />
      case 'spend':
        return <CreditCard className="w-4 h-4 text-red-600" />
      case 'transfer':
        return <ArrowRight className="w-4 h-4 text-blue-600" />
      case 'yield':
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      case 'topup':
        return <Plus className="w-4 h-4 text-green-600" />
      default:
        return <Zap className="w-4 h-4 text-yellow-600" />
    }
  }

  // Helper to get action text for transaction type
  const getActionText = (tx: Transaction) => {
    switch (tx.type) {
      case 'deposit':
        return 'Deposit';
      case 'spend':
        return 'Card Spend';
      case 'transfer':
        return 'Transfer to Card';
      case 'yield':
        return 'Yield Earned';
      case 'topup':
        return 'Add Funds';
      default:
        return tx.description;
    }
  }

  // Helper to format the transaction amount
  const formatAmount = (amount: number) => {
    const isNegative = amount < 0
    const absAmount = Math.abs(amount)
    return (
      <span className={isNegative ? 'text-red-600' : 'text-green-600'}>
        {isNegative ? '-' : '+'} ${absAmount.toFixed(2)}
      </span>
    )
  }

  // Helper to format time - use relative time for recent transactions (today)
  const formatTime = (timestamp: Date) => {
    const txDate = new Date(timestamp);
    const today = new Date();
    
    // If transaction is from today, show relative time
    if (txDate.toDateString() === today.toDateString()) {
      return formatDistance(txDate, currentTime, { addSuffix: true });
    }
    
    // Otherwise show the date
    return format(txDate, 'yyyy-MM-dd');
  }

  // Group transactions by date
  const groupedTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, displayLimit)
    .reduce((groups, transaction) => {
      const date = new Date(transaction.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);

  return (
    <>
      <Card key={refreshKey}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Transaction History</CardTitle>
            <CardDescription>Your recent activity</CardDescription>
          </div>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 pb-1 border-b">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                <div className="space-y-2">
                  {txs.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleTransactionClick(tx)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'deposit' || tx.type === 'topup'
                            ? 'bg-green-100'
                            : tx.type === 'yield'
                              ? 'bg-blue-100'
                              : tx.type === 'spend'
                                ? 'bg-red-100'
                                : 'bg-blue-100'
                        }`}>
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-medium flex items-center">
                            {getActionText(tx)}
                            <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatAmount(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {transactions.length > displayLimit && (
              <button 
                onClick={() => setDisplayLimit(prev => prev + 10)}
                className="w-full p-2 text-sm text-center text-blue-600 hover:text-blue-800 hover:underline"
              >
                Show more transactions
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
          {selectedTransaction && (
            <TransactionReceipt 
              transaction={selectedTransaction} 
              onClose={() => setReceiptOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}