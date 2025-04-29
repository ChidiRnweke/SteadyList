
import { useState, useEffect } from "react"
import type { User, Session } from "./types"

// Mock user data
const MOCK_USER: User = {
  id: "user-1",
  name: "Demo User",
  email: "demo@example.com",
  image: "/placeholder.svg?height=40&width=40",
}

// Local storage keys
const SESSION_KEY = "mock_session"

// Mock SSO authentication
export async function mockSignIn(provider: string): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Create a session that expires in 7 days
  const session: Session = {
    user: MOCK_USER,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }

  // Store session in localStorage
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

// Mock sign out
export async function mockSignOut(): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Remove session from localStorage
  localStorage.removeItem(SESSION_KEY)
}

// Get current session (for server components)
export async function getSession(): Promise<Session | null> {
  // This is a mock implementation that would normally check cookies or headers
  // In a real implementation, this would be server-side code

  // For demo purposes, we're simulating this by returning a mock session
  return {
    user: MOCK_USER,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

// Hook to get the current user (for client components)
export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const sessionData = localStorage.getItem(SESSION_KEY)

    if (sessionData) {
      try {
        const session: Session = JSON.parse(sessionData)

        // Check if session is expired
        if (new Date(session.expires) > new Date()) {
          setUser(session.user)
        } else {
          // Session expired, remove it
          localStorage.removeItem(SESSION_KEY)
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to parse session data:", error)
        setUser(null)
      }
    }
  }, [])

  return user
}
