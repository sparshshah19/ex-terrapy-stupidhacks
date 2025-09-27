import type { OnboardingData } from "@/components/onboarding-modal"

export interface ChatSession {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  persona: "blunt" | "therapy" | "closure"
  messageCount: number
  lastMessage: string
  onboardingData?: OnboardingData
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  persona?: "blunt" | "therapy" | "closure"
  images?: string[]
  sentiment?: "positive" | "negative" | "neutral"
  safety?: {
    flagged: boolean
    reason?: string
  }
}

class ChatStorageManager {
  private readonly STORAGE_KEY = "healing-chat-sessions"
  private readonly CURRENT_SESSION_KEY = "healing-chat-current"

  // Get all chat sessions
  getSessions(): ChatSession[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const sessions = JSON.parse(stored)
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
    } catch (error) {
      console.error("Error loading chat sessions:", error)
      return []
    }
  }

  // Save a chat session
  saveSession(session: ChatSession): void {
    if (typeof window === "undefined") return

    try {
      const sessions = this.getSessions()
      const existingIndex = sessions.findIndex((s) => s.id === session.id)

      if (existingIndex >= 0) {
        sessions[existingIndex] = session
      } else {
        sessions.unshift(session) // Add new sessions to the beginning
      }

      // Keep only the last 50 sessions
      const limitedSessions = sessions.slice(0, 50)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedSessions))
    } catch (error) {
      console.error("Error saving chat session:", error)
    }
  }

  // Delete a chat session
  deleteSession(sessionId: string): void {
    if (typeof window === "undefined") return

    try {
      const sessions = this.getSessions()
      const filteredSessions = sessions.filter((s) => s.id !== sessionId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions))
    } catch (error) {
      console.error("Error deleting chat session:", error)
    }
  }

  // Get current session ID
  getCurrentSessionId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.CURRENT_SESSION_KEY)
  }

  // Set current session ID
  setCurrentSessionId(sessionId: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.CURRENT_SESSION_KEY, sessionId)
  }

  // Create a new session
  createSession(onboardingData: OnboardingData, persona: "blunt" | "therapy" | "closure"): ChatSession {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const title = this.generateSessionTitle(onboardingData)

    const session: ChatSession = {
      id: sessionId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      persona,
      messageCount: 0,
      lastMessage: "",
      onboardingData,
      messages: [],
    }

    this.saveSession(session)
    this.setCurrentSessionId(sessionId)
    return session
  }

  // Generate a session title based on onboarding data
  private generateSessionTitle(onboardingData: OnboardingData): string {
    const date = new Date().toLocaleDateString()

    if (onboardingData.exName) {
      return `Chat about ${onboardingData.exName} - ${date}`
    }

    const modeNames = {
      blunt: "Blunt Chat",
      therapy: "Therapy Session",
      closure: "Closure Session",
    }

    return `${modeNames[onboardingData.mode]} - ${date}`
  }

  // Update session with new messages
  updateSessionMessages(sessionId: string, messages: ChatMessage[]): void {
    const sessions = this.getSessions()
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

    if (sessionIndex >= 0) {
      const session = sessions[sessionIndex]
      session.messages = messages
      session.messageCount = messages.length
      session.updatedAt = new Date()

      // Update last message
      const lastUserMessage = messages.filter((m) => m.sender === "user").pop()
      session.lastMessage = lastUserMessage?.content.slice(0, 100) || ""

      this.saveSession(session)
    }
  }

  // Search sessions
  searchSessions(query: string): ChatSession[] {
    const sessions = this.getSessions()
    const lowerQuery = query.toLowerCase()

    return sessions.filter((session) => {
      return (
        session.title.toLowerCase().includes(lowerQuery) ||
        session.lastMessage.toLowerCase().includes(lowerQuery) ||
        session.onboardingData?.exName?.toLowerCase().includes(lowerQuery) ||
        session.messages.some((msg) => msg.content.toLowerCase().includes(lowerQuery))
      )
    })
  }

  // Export session data
  exportSession(sessionId: string): string {
    const sessions = this.getSessions()
    const session = sessions.find((s) => s.id === sessionId)

    if (!session) return ""

    const exportData = {
      title: session.title,
      createdAt: session.createdAt,
      persona: session.persona,
      messages: session.messages.map((msg) => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }
}

export const chatStorage = new ChatStorageManager()
