'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Check, Wallet, Copy } from "lucide-react";
import { onboardUser, isValidEmail, storeUserData, type OnboardingData } from "@/lib/circle-client";
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useGoogleLogin } from '@react-oauth/google';

interface OnboardingFormProps {
  onSuccess: (userData: OnboardingData) => void;
}

export function OnboardingForm({ onSuccess }: OnboardingFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle form submission (not used with Google button)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger the Google login flow
    login();
  };

  // Set up Google OAuth login
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        // Get user info from Google using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        const userInfo = await userInfoResponse.json();
        const googleEmail = userInfo.email;
        
        if (!googleEmail) {
          throw new Error('Failed to get email from Google');
        }
        
        console.log("Google authentication successful, email:", googleEmail);
        
        // Use the email from Google to onboard the user
        const result = await onboardUser(googleEmail, 'ETH-SEPOLIA');
        setUserData(result);
        storeUserData(result);
        
        // If this is an existing user, show a message
        if (result.isExistingUser) {
          console.log("Welcome back! Logging in with existing Google account.");
        } else {
          console.log("New user created with Google account.");
        }
        
        onSuccess(result);
      } catch (error: any) {
        console.error("Google login failed:", error);
        setError(error.message || "Failed to login with Google. Please try again.");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google login error:", errorResponse);
      setError("Google login failed. Please try again.");
    },
    flow: 'implicit', // Use implicit flow for client-side only
  });

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
          Smart Spending from Yield – Sign in with Google to create your secure Circle Wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Button
              type="button"
              onClick={() => login()}
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
              size="lg"
            >
              {isLoading || isGoogleLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Creating wallet...</span>
                </div>
              ) : (
                "Create a secure Circle wallet with just your email"
              )}
            </Button>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Secured with Google Sign-in</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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