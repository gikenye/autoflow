import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        // For wallet authentication, we'll handle it separately
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        // Here you would typically verify credentials with your backend
        // For now, we'll implement a simple email-based auth for demonstration
        if (credentials.email) {
          // Return a mock user object for now
          // In a real app, validate against a database/API
          return {
            id: "1",
            email: credentials.email,
            name: credentials.email.split('@')[0],
            provider: "email"
          };
        }
        return null;
      },
    }),
    // We'll use a custom Credentials provider for wallet auth
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        address: { label: "Address", type: "text" },
        provider: { label: "Provider", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        // In a real app, you'd verify the wallet signature
        // For demonstration, we'll accept the wallet address directly
        if (credentials.address) {
          return {
            id: credentials.address,
            address: credentials.address,
            name: `${credentials.address.substring(0, 6)}...${credentials.address.substring(credentials.address.length - 4)}`,
            provider: credentials.provider || "metamask"
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add custom properties to the session
      if (token.address) {
        session.user.address = token.address as string;
      }
      if (token.provider) {
        session.user.provider = token.provider as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Persist custom user properties to the token
      if (user) {
        token.address = user.address;
        token.provider = user.provider;
      }
      return token;
    }
  },
  pages: {
    signIn: '/', // We'll handle signin within our app using a modal
    signOut: '/',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "autoflow-secret-key-change-in-production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 