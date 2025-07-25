"use client"

import { useState, useEffect } from "react"
import { TrendingUp, CreditCard, History, Settings, Plus, Zap, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Imports for Web3 integration and components
import { WalletProvider, useWallet } from "@/hooks/useWallets"
import { AuthModal } from "@/components/auth/AuthModal"
import { WalletInfo } from "@/components/wallet/WalletInfo"
import { CardSpendSimulator } from "@/components/CardSpendSimulator"
import { TransactionLog } from "@/components/TransactionLog"
import { WalletToCardTransfer } from "@/components/WalletToCardTransfer"
import { AaveYieldSpender } from "@/components/AaveYieldSpender"
import MetaMaskCard from "@/pages/metamask-card"
import { signOut, useSession } from "next-auth/react"

// Mock data
const mockData = {
  balance: 847.32,
  yieldEarned: 1.38,
  creditAvailable: 423.66,
  healthFactor: 85,
  weeklyYield: 12.45,
  transactions: [
    { id: 1, date: "2024-01-15", action: "Deposit", amount: 500, type: "deposit" },
    { id: 2, date: "2024-01-14", action: "Yield Earned", amount: 1.38, type: "yield" },
    { id: 3, date: "2024-01-13", action: "Card Spend", amount: -45.2, type: "spend" },
    { id: 4, date: "2024-01-12", action: "Auto-Repay", amount: -12.5, type: "repay" },
  ],
}

function AutoFlowAppContent() {
  const { data: session } = useSession()
  const { user, isConnected, cardInfo, getBalance, disconnect } = useWallet()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [spendingMode, setSpendingMode] = useState("yield-only")
  const [creditLimit, setCreditLimit] = useState([50])
  const [autoRepay, setAutoRepay] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [walletBalance, setWalletBalance] = useState("0")
  const [depositAmount, setDepositAmountState] = useState("0")
  // Add states for MetaMask card actions
  const [spendCount, setSpendCount] = useState(0)
  const [depositCount, setDepositCount] = useState(0)
  
  // Update wallet balance when user changes or tab changes
  useEffect(() => {
    const updateBalance = async () => {
      if (user) {
        const balance = await getBalance()
        setWalletBalance(balance)
      }
    }
    
    updateBalance()
  }, [user, activeTab, getBalance])

  function setDepositAmount(amount: number): void {
    const depositField = document.getElementById("amount") as HTMLInputElement;
    if (depositField) {
      depositField.value = amount.toString();
    }
  }

  // Add handlers for MetaMask card actions
  const handleSpendClick = () => {
    setSpendCount((prev) => prev + 1)
    console.log("Spending yield...", spendCount + 1)
    
    // Simulate spending $10 from balance
    const spendAmount = 10
    mockData.balance = Math.max(0, mockData.balance - spendAmount)
    
    // Navigate to profile tab which contains the AaveYieldSpender component
    setActiveTab("profile")
    // Scroll to the AaveYieldSpender component after a short delay to ensure rendering
    setTimeout(() => {
      document.querySelector('.AaveYieldSpender')?.scrollIntoView({ behavior: 'smooth' })
      // Show notification of successful spend
      alert(`Successfully spent $${spendAmount} from your yield`)
    }, 100)
  }

  // Add a function to actually process deposits when the main deposit button is clicked
  const processDeposit = () => {
    const amountField = document.getElementById("amount") as HTMLInputElement
    if (amountField && amountField.value) {
      const depositAmount = parseFloat(amountField.value)
      if (!isNaN(depositAmount) && depositAmount > 0) {
        console.log(`Processing deposit of $${depositAmount}...`)
        // Update deposit count for tracking
        setDepositCount((prev) => prev + 1)
        
        // Update mock balance
        mockData.balance += depositAmount
        
        // Here you would typically call your API or blockchain transaction
        // For now, show a success message
        alert(`Successfully deposited $${depositAmount} USDC. New balance: $${mockData.balance.toLocaleString()}`)
        
        // Reset the field
        amountField.value = ""
        
        // Return to dashboard to see updated balance
        setActiveTab("dashboard")
      }
    }
  }

  // Header section with session info
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-green-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AutoFlow</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Smart Spending from Yield</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isConnected ? (
                <Button 
                  onClick={() => setShowAuthModal(true)} 
                  className="bg-green-600 hover:bg-green-700 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                  size="sm"
                >
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </Button>
              ) : (
                <>
                  <WalletInfo />
                  <Button 
                    onClick={() => {
                      signOut({ redirect: false });
                      disconnect();
                    }} 
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {!isConnected ? (
          // Welcome & Onboarding Page
          <div className="py-6 sm:py-12 md:py-20">
            <div className="max-w-4xl mx-auto">
              {/* Hero Section */}
              <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Welcome to AutoFlow
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-green-600 font-semibold mb-2">
                  Smart Spending from Yield
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-6 sm:mb-8 px-4">
                  Earn while you spend, spend while you earn
              </p>
                
                {/* Main CTA Button - Mobile First */}
                <div className="mb-8 sm:mb-12 px-4">
                  <Button 
                    onClick={() => setShowAuthModal(true)} 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-base sm:text-lg px-6 sm:px-12 py-4 sm:py-5 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Started - Create Wallet
                  </Button>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">
                    Create your secure wallet with just an email • Free to start
                  </p>
                </div>
              </div>

              {/* Feature Cards - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 px-4">
                <Card className="border-green-200 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">Earn Yield</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                      Deposit USDC and earn competitive yields automatically
                    </p>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-green-800">5.2% APY</p>
                      <p className="text-xs text-green-600">Current rate</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">Smart Spending</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                      Spend from yield or access credit lines safely via MetaMask Card
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-blue-800">MetaMask Card</p>
                      <p className="text-xs text-blue-600">Integrated</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">Auto-Repay</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                      Automatic repayments from your earned yield
                    </p>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-800">Smart Repay</p>
                      <p className="text-xs text-yellow-600">Automated</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* How It Works - Mobile Friendly */}
              <Card className="border-gray-200 mb-6 sm:mb-8 mx-4 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl sm:text-2xl mb-2">How AutoFlow Works</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Simple, secure, and automated DeFi experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { step: "1", title: "Create Wallet", desc: "Sign up with email and get a secure Circle Wallet" },
                      { step: "2", title: "Deposit USDC", desc: "Add funds and start earning yield automatically" },
                      { step: "3", title: "Link MetaMask Card", desc: "Connect your card for seamless spending" },
                      { step: "4", title: "Smart Spend", desc: "Spend from yield or use credit with auto-repay" }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                          <span className="text-green-600 font-bold text-lg">{item.step}</span>
                        </div>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Final CTA */}
              <div className="text-center px-4">
                <Button 
                  onClick={() => setShowAuthModal(true)} 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Start Earning - It's Free
              </Button>
              </div>
            </div>
          </div>
        ) : (
          // App Interface
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Desktop Navigation */}
            <div className="hidden md:block mb-8">
              <TabsList className="grid w-full grid-cols-5 max-w-md mx-auto">
                <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="deposit" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Deposit</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>History</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Updated layout with MetaMask Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* MetaMask Card - New UI */}
                <div className="md:col-span-1">
                  <MetaMaskCard
                    cardholderName={user?.name ? user.name.toUpperCase() : session?.user?.name ? session.user.name.toUpperCase() : "AUTOFLOW USER"}
                    balance={mockData.balance.toLocaleString()}
                    walletAddress={user?.address ? `${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}` : "0xAbC1...DeF9"}
                    expirationDate="08/27"
                    lastFourDigits={cardInfo?.lastFour || "1337"}
                    onSpendClick={handleSpendClick}
                    onDepositClick={processDeposit}
                  />
                </div>

                {/* Stats Cards - Adjusted Layout */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardDescription>Credit Available</CardDescription>
                      <CardTitle className="text-2xl text-blue-700">
                        ${mockData.creditAvailable.toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        You can safely spend{" "}
                        <span className="font-medium">${Math.floor(mockData.creditAvailable * 0.1)}</span>
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardDescription>Health Factor</CardDescription>
                      <CardTitle className="text-2xl text-green-700">{mockData.healthFactor}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={mockData.healthFactor} className="h-2" />
                      <p className="text-sm text-gray-600 mt-2">Excellent health</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Card Spending Simulator */}
              <CardSpendSimulator />

              {/* Spending Mode */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Spending Mode</CardTitle>
                  <CardDescription>Choose how you want to spend</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        spendingMode === "yield-only"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() => setSpendingMode("yield-only")}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            spendingMode === "yield-only" ? "border-green-500 bg-green-500" : "border-gray-300"
                          }`}
                        >
                          {spendingMode === "yield-only" && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">Yield-Only</h4>
                          <p className="text-sm text-gray-600">Spend only from earned yield</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        spendingMode === "credit-hybrid"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() => setSpendingMode("credit-hybrid")}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            spendingMode === "credit-hybrid" ? "border-green-500 bg-green-500" : "border-gray-300"
                          }`}
                        >
                          {spendingMode === "credit-hybrid" && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">Credit + Yield</h4>
                          <p className="text-sm text-gray-600">Access credit with auto-repay</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deposit */}
            <TabsContent value="deposit" className="space-y-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-green-600" />
                    <span>Deposit Assets</span>
                  </CardTitle>
                  <CardDescription>
                    Add USDC to start earning yield automatically
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="asset">Select Asset</Label>
                    <Select defaultValue="usdc">
                      <SelectTrigger>
                        <SelectValue placeholder="Choose asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usdc">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <span>💵</span>
                              <span>USDC</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800 ml-2">
                              5.2% APY
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="dai">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <span>🏛️</span>
                              <span>DAI</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800 ml-2">
                              5.0% APY
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="eth">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <span>⟠</span>
                              <span>ETH</span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 ml-2">
                              4.8% APY
                            </Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600">
                      💡 <strong>Recommended:</strong> USDC provides stable, reliable yield
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input 
                        id="amount" 
                        type="number" 
                        placeholder="0.00" 
                        className="text-lg pl-8" 
                        min="10"
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Minimum: $10</span>
                      <span>Maximum: $100,000</span>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="space-y-2">
                    <Label>Quick amounts</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 250, 500].map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositAmount(amount)}
                          className="text-sm"
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-green-800">Estimated Earnings (5.2% APY)</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily yield:</span>
                        <span className="font-medium text-green-600">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weekly yield:</span>
                        <span className="font-medium text-green-600">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly yield:</span>
                        <span className="font-medium text-green-600">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual yield:</span>
                        <span className="font-medium text-green-600">$0.00</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-white rounded border border-green-200">
                      <p className="text-xs text-gray-600">
                        💡 <strong>Tooltip:</strong> Deposits are routed to yield strategies like Aave for maximum returns
                      </p>
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" onClick={processDeposit}>
                    <Plus className="w-4 h-4 mr-2" />
                    Deposit USDC
                  </Button>

                  {/* Additional Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">How deposits work:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Funds are deposited into secure DeFi protocols</li>
                      <li>✓ Earn yield automatically while maintaining liquidity</li>
                      <li>✓ Use earned yield for spending or access safe credit lines</li>
                      <li>✓ Withdraw anytime with no lock-up periods</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Credit Settings</CardTitle>
                  <CardDescription>Configure your credit preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Credit Utilization Limit</Label>
                      <p className="text-sm text-gray-600 mb-4">
                        Set maximum percentage of your balance to use as credit
                      </p>
                      <div className="space-y-3">
                        <Slider
                          value={creditLimit}
                          onValueChange={setCreditLimit}
                          max={70}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>0%</span>
                          <span className="font-medium text-green-600">{creditLimit[0]}%</span>
                          <span>70%</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Auto-Repay from Yield</Label>
                        <p className="text-sm text-gray-600">Automatically repay credit using earned yield</p>
                      </div>
                      <Switch checked={autoRepay} onCheckedChange={setAutoRepay} />
                    </div>

                    <Separator />

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Health Factor</h4>
                      <div className="flex items-center space-x-3">
                        <Progress value={mockData.healthFactor} className="flex-1 h-3" />
                        <span className="font-medium text-green-600">{mockData.healthFactor}%</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {mockData.healthFactor >= 80 ? "Excellent" : mockData.healthFactor >= 60 ? "Good" : "Caution"}{" "}
                        health status
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-6">
              {/* Import and use our dynamic TransactionLog component */}
              <div className="space-y-6">
                {/* Replace static transaction history with our dynamic component */}
                {isConnected && <TransactionLog />}
                
                {/* Show placeholder if not connected */}
                {!isConnected && (
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>Your recent activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-600">Connect your wallet to see transaction history</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Analytics Chart Placeholder */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Yield vs Spending</CardTitle>
                  <CardDescription>Track your earning and spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-600">Analytics chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Profile Card */}
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-green-600" />
                      <span>User Profile</span>
                    </CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user && (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            {user.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                alt="Profile" 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">
                              {user.name || user.email?.split('@')[0] || 'User'}
                            </h3>
                            {user.email && (
                              <p className="text-sm text-gray-600">{user.email}</p>
                            )}
                            <Badge className="mt-1">
                              {user.provider === "metamask" ? "MetaMask" : "Circle"} Wallet
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Wallet Address</h4>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-gray-100 p-2 rounded flex-1 overflow-hidden overflow-ellipsis">
                              {user.address}
                            </code>
                            <Button variant="outline" size="sm" className="shrink-0">
                              Copy
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <p className="text-sm text-green-700 mb-1">Wallet Balance</p>
                            <p className="text-lg font-semibold text-green-700">
                              ${walletBalance}
                            </p>
                          </div>
                          
                          {cardInfo?.isLinked && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <p className="text-sm text-blue-700 mb-1">Card Balance</p>
                              <p className="text-lg font-semibold text-blue-700">
                                ${cardInfo.balance?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Transfer to Card Component */}
                <WalletToCardTransfer />
              </div>
              
              {/* Yield Spending Section */}
              <div className="grid grid-cols-1 gap-6">
                <AaveYieldSpender />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isConnected && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 shadow-lg">
          <div className="grid grid-cols-5 px-2 py-2">
            {[
              { id: "dashboard", icon: TrendingUp, label: "Dashboard" },
              { id: "deposit", icon: Plus, label: "Deposit" },
              { id: "settings", icon: Settings, label: "Settings" },
              { id: "history", icon: History, label: "History" },
              { id: "profile", icon: User, label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-3 px-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id 
                    ? "text-green-600 bg-green-50 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
                style={{ minHeight: '64px' }}
              >
                <tab.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      {/* Debug info - remove in production */}
      {(spendCount > 0 || depositCount > 0) && (
        <div className="fixed top-4 left-4 bg-black/80 text-white p-2 rounded text-sm">
          Spend: {spendCount} | Deposit: {depositCount}
        </div>
      )}
    </div>
  )
}

export default function AutoFlowApp() {
  return (
    <WalletProvider>
      <AutoFlowAppContent />
    </WalletProvider>
  )
}
