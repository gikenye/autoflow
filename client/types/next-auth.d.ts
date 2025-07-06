import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      /** Extend the user properties */
      address?: string
      provider?: string
    } & DefaultSession['user']
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    address?: string
    provider?: string
  }
}

declare module 'next-auth/jwt' {
  /** Extend the JWT payload */
  interface JWT {
    address?: string
    provider?: string
  }
} 