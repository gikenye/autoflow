"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/useWallets"
import type { Transaction } from "@/hooks/useWallets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  ArrowRight, 
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink
} from "lucide-react"
import { format } from "date-fns"

interface TransactionReceiptProps {
  transaction: Transaction
  onClose: () => void
}

export function TransactionReceipt({ transaction, onClose }: TransactionReceiptProps) {
  const [copied, setCopied] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { transactions } = useWallet()
  
  // Find the latest version of this transaction in case it's been updated
  const currentTransaction = transactions.find(tx => tx.id === transaction.id) || transaction
  
  // Use blockchain data from the transaction, or generate defaults if none exists
  const blockchain = currentTransaction.blockchain || {
    txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    blockNumber: null,
    gasUsed: Math.floor(21000 + Math.random() * 100000),
    gasPrice: (Math.random() * 20 + 10).toFixed(2),
    gasFee: (Math.floor(21000 + Math.random() * 100000) * (Math.random() * 20 + 10) / 1e9).toFixed(6),
    network: transaction.type === "spend" ? "Polygon" : "Ethereum",
    currency: transaction.type === "spend" ? "MATIC" : "ETH",
    fromAddress: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    toAddress: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    confirmations: 0,
    status: "pending" as const
  }
  
  // Refresh component every few seconds to reflect updated status
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle copy transaction hash
  const copyTxHash = () => {
    navigator.clipboard.writeText(blockchain.txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Get transaction icon
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return <Plus className="w-5 h-5 text-green-600" />
      case 'spend':
        return <CreditCard className="w-5 h-5 text-red-600" />
      case 'transfer':
        return <ArrowRight className="w-5 h-5 text-blue-600" />
      case 'yield':
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      case 'topup':
        return <Plus className="w-5 h-5 text-green-600" />
      default:
        return <Plus className="w-5 h-5 text-green-600" />
    }
  }
  
  // Get transaction title
  const getTransactionTitle = () => {
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit Transaction'
      case 'spend':
        return 'Card Spend Transaction'
      case 'transfer':
        return 'Transfer Transaction'
      case 'yield':
        return 'Yield Collection Transaction'
      case 'topup':
        return 'Card Topup Transaction'
      default:
        return 'Transaction Receipt'
    }
  }
  
  // Get transaction status badge
  const getStatusBadge = () => {
    const isPending = blockchain.status === "pending";
    const isProcessing = blockchain.status === "processing";
    const isConfirmed = blockchain.status === "confirmed";
    
    if (isPending) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Pending</span>
        </Badge>
      )
    } else if (isProcessing || (isConfirmed && blockchain.confirmations < 6)) {
      return (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Processing</span>
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Confirmed</span>
        </Badge>
      )
    }
  }
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  return (
    <Card className="border-2 border-green-200 shadow-lg max-w-2xl w-full mx-auto" key={refreshKey}>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            transaction.type === 'deposit' || transaction.type === 'topup'
              ? 'bg-green-100'
              : transaction.type === 'yield'
                ? 'bg-blue-100'
                : transaction.type === 'spend'
                  ? 'bg-red-100'
                  : 'bg-blue-100'
          }`}>
            {getTransactionIcon()}
          </div>
          <div>
            <CardTitle>{getTransactionTitle()}</CardTitle>
            <CardDescription>
              {format(new Date(transaction.timestamp), "PPpp")}
            </CardDescription>
          </div>
        </div>
        {getStatusBadge()}
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Amount and Description */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-xl font-bold text-gray-900">
                ${Math.abs(transaction.amount).toFixed(2)} 
                <span className="text-sm text-gray-500 ml-1">
                  {transaction.type === 'spend' ? 'USDC' : 'USDC'}
                </span>
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full ${
              transaction.amount < 0 
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}>
              <span className="font-medium">
                {transaction.amount < 0 ? 'Outgoing' : 'Incoming'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {transaction.description}
          </p>
        </div>
        
        {/* Transaction Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Transaction Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Transaction Hash</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono">{formatAddress(blockchain.txHash)}</span>
                <button 
                  onClick={copyTxHash} 
                  className="p-1 hover:bg-gray-100 rounded-full"
                  title="Copy transaction hash"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Status</span>
              <div className="flex items-center">
                <span className="text-sm mr-2">
                  {blockchain.status === "pending" ? 'Pending' : 
                   blockchain.status === "processing" ? 'Processing' : 'Confirmed'}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  blockchain.status === "pending" ? 'bg-yellow-500' : 
                  blockchain.status === "processing" ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Block</span>
              <span className="text-sm">
                {blockchain.blockNumber ? blockchain.blockNumber.toLocaleString() : 'Pending...'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Confirmations</span>
              <span className="text-sm">
                {blockchain.status === "pending" ? '0' : blockchain.confirmations}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">From</span>
              <span className="text-sm font-mono">{formatAddress(blockchain.fromAddress)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">To</span>
              <span className="text-sm font-mono">{formatAddress(blockchain.toAddress)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Network</span>
              <span className="text-sm">{blockchain.network}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Gas Used</span>
              <span className="text-sm">
                {blockchain.status === "pending" ? 'Estimating...' : blockchain.gasUsed.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Gas Price</span>
              <span className="text-sm">
                {blockchain.status === "pending" ? 'Estimating...' : `${blockchain.gasPrice} Gwei`}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Network Fee</span>
              <span className="text-sm">
                {blockchain.status === "pending" ? 'Estimating...' : `${blockchain.gasFee} ${blockchain.currency}`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between border-t pt-4">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={onClose}
        >
          Close
        </Button>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto flex items-center gap-2 border-blue-200"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on Explorer</span>
          </Button>
          
          <Button 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            disabled={blockchain.status === "pending"}
          >
            {blockchain.status === "pending" ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                <span>Processing</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>Verified</span>
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 