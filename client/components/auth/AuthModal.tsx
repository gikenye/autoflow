"use client"

import { useState } from "react"
import { useWallet } from "@/hooks/useWallets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wallet, Mail, Chrome, Loader2, CheckCircle, Copy, Check } from "lucide-react"
import { onboardUser, isValidEmail, storeUserData, type OnboardingData } from "@/lib/circle-client"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { connect, isLoading } = useWallet()
  const [connectingMethod, setConnectingMethod] = useState<string | null>(null)
  const [showCircleForm, setShowCircleForm] = useState(false)
  const [email, setEmail] = useState("")
  const [circleError, setCircleError] = useState<string | null>(null)
  const [userData, setUserData] = useState<OnboardingData | null>(null)
  const [copied, setCopied] = useState(false)

  const handleConnect = async (method: "circle" | "metamask") => {
    try {
      setConnectingMethod(method)
      if (method === "circle") {
        setShowCircleForm(true)
        return
      }
      await connect(method)
      onClose()
    } catch (error) {
      console.error("Connection failed:", error)
    } finally {
      setConnectingMethod(null)
    }
  }

  const handleCircleOnboard = async (e: React.FormEvent) => {
    e.preventDefault()
    setCircleError(null)

    if (!email.trim()) {
      setCircleError("Please enter your email address")
      return
    }

    if (!isValidEmail(email)) {
      setCircleError("Please enter a valid email address")
      return
    }

    setConnectingMethod("circle")

    try {
      const result = await onboardUser(email, 'ETH-SEPOLIA')
      setUserData(result)
      storeUserData(result)
      
      // Connect with the created user data
      await connect("circle", result)
      
      setTimeout(() => {
        onClose()
        resetState()
      }, 3000)
    } catch (error: any) {
      console.error("Circle onboarding failed:", error)
      setCircleError(error.message || "Failed to create wallet. Please try again.")
    } finally {
      setConnectingMethod(null)
    }
  }

  const resetState = () => {
    setShowCircleForm(false)
    setEmail("")
    setCircleError(null)
    setUserData(null)
    setCopied(false)
  }

  const copyAddress = async () => {
    if (userData?.walletAddress) {
      await navigator.clipboard.writeText(userData.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
        resetState()
      }
    }}>
      <DialogContent className="sm:max-w-md">
        {userData ? (
          // Success State
          <>
        <DialogHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <DialogTitle className="text-center text-green-800">Welcome to AutoFlow!</DialogTitle>
              <DialogDescription className="text-center">
                Your Circle Wallet has been created successfully
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">{userData.email}</p>
                    <p className="text-sm text-gray-600">Account Email</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm">{formatAddress(userData.walletAddress)}</p>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyAddress}>
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Wallet Address</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800">{userData.blockchain}</Badge>
                  <p className="text-xs text-gray-600 mt-1">Network</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline">{userData.accountType}</Badge>
                  <p className="text-xs text-gray-600 mt-1">Account Type</p>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Redirecting to dashboard... You can now deposit USDC and start earning yield!
                </AlertDescription>
              </Alert>
            </div>
          </>
        ) : showCircleForm ? (
          // Circle Email Form
          <>
            <DialogHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <DialogTitle className="text-center">Create Your Circle Wallet</DialogTitle>
              <DialogDescription className="text-center">
                Enter your email to create a secure programmable wallet
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCircleOnboard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={connectingMethod === "circle"}
                  className="text-base"
                />
              </div>

              {circleError && (
                <Alert variant="destructive">
                  <AlertDescription>{circleError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={connectingMethod === "circle" || !email.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {connectingMethod === "circle" ? (
                  <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Your Wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Create Circle Wallet
                  </>
                )}
              </Button>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">What you'll get:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Secure programmable wallet</li>
                  <li>✓ Email-based account recovery</li>
                  <li>✓ Earn yield on USDC deposits</li>
                  <li>✓ Smart spending with MetaMask Card</li>
                </ul>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCircleForm(false)}
                className="w-full"
              >
                Back to options
              </Button>
            </form>
          </>
        ) : (
          // Connection Options
          <>
            <DialogHeader>
              <DialogTitle>Welcome to AutoFlow</DialogTitle>
              <DialogDescription>
                Smart Spending from Yield – Choose your preferred way to connect and start earning
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Circle Login Options */}
              <Card className="border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Easy Setup</CardTitle>
                  <CardDescription>
                    Create a secure Circle wallet with just your email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleConnect("circle")}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Create with Email
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* MetaMask Option */}
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Web3 Wallet</CardTitle>
              <CardDescription>Connect your existing crypto wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleConnect("metamask")}
                disabled={isLoading}
                variant="outline"
                className="w-full border-orange-300 hover:bg-orange-50"
                size="lg"
              >
                {connectingMethod === "metamask" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                Connect MetaMask
              </Button>
            </CardContent>
          </Card>

          <p className="text-xs text-gray-500 text-center">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
