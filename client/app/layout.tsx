import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoFlow",
  description: "Smart Spending from Yield",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Google OAuth Client ID - in production, this should be in an environment variable
  // You need to create a project in Google Cloud Console and enable the Google OAuth API
  // Then create OAuth credentials for a Web application
  // Visit: https://console.cloud.google.com/apis/credentials
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''; // ⚠️ Replace with your actual client ID

  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
