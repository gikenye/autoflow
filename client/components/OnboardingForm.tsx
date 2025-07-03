'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, Mail, Wallet, Copy, Check } from 'lucide-react';
import { onboardUser, isValidEmail, storeUserData, type OnboardingData } from '@/lib/circle-client';

interface OnboardingFormProps {
  onSuccess: (userData: OnboardingData) => void;
}

export function OnboardingForm({ onSuccess }: OnboardingFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await onboardUser(email, 'ETH-SEPOLIA');
      setUserData(result);
      storeUserData(result);
      onSuccess(result);
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      setError(error.message || 'Failed to create wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = async () => {
    if (userData?.walletAddress) {
      await navigator.clipboard.writeText(userData.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  if (userData) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Welcome to AutoFlow!</CardTitle>
          <CardDescription>Your Circle Wallet has been created successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="bg-white p-4 rounded-lg border border-green-200">
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

          {/* Wallet Details */}
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

          {/* Next Steps */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your wallet is ready! You can now deposit USDC and start earning yield.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle>Welcome to AutoFlow</CardTitle>
        <CardDescription>
          Smart Spending from Yield – Enter your email to create your secure Circle Wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="text-base"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isLoading ? (
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

          <p className="text-xs text-gray-500 text-center">
            By creating a wallet, you agree to our Terms of Service and Privacy Policy.
            Your wallet is secured by Circle's technology.
          </p>
        </form>
      </CardContent>
    </Card>
  );
} 