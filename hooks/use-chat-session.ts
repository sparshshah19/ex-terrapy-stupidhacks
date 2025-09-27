"use client"

import { useState, useEffect, useCallback } from "react"
import { chatStorage, type ChatSession, type ChatMessage } from "@/lib/chat-storage"
import type { OnboardingData } from "@/components/onboarding-modal"

export function useChatSession() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load current session on mount
  useEffect(() => {
    const currentSessionId = chatStorage.getCurrentSessionId()
    if (currentSessionId) {
      const sessions = chatStorage.getSessions()
      const session = sessions.find((s) => s.id === currentSessionId)
      if (session) {
        setCurrentSession(session)
        setMessages(session.messages)
      }
    }
    setIsLoading(false)
  }, [])

  // Create a new session
  const createSession = useCallback((onboardingData: OnboardingData, persona: "blunt" | "therapy" | "closure") => {
    console.log('Creating session with data:', onboardingData, 'persona:', persona);
    const newSession = chatStorage.createSession(onboardingData, persona)
    console.log('New session created:', newSession);
    setCurrentSession(newSession)
    setMessages([])
    console.log('Session and messages state updated');
    return newSession
  }, [])

  // Load an existing session
  const loadSession = useCallback((session: ChatSession) => {
    setCurrentSession(session)
    setMessages(session.messages)
    chatStorage.setCurrentSessionId(session.id)
  }, [])

  // Add a message to the current session
  const addMessage = useCallback(
    (message: ChatMessage) => {
      console.log('addMessage called with:', message, 'currentSession:', currentSession);
      
      // Get current session ID, either from state or from localStorage as fallback
      const sessionId = currentSession?.id || chatStorage.getCurrentSessionId();
      
      if (!sessionId) {
        console.log('No current session ID, message not added');
        return;
      }

      setMessages(prevMessages => {
        console.log('setMessages called. Previous messages:', prevMessages.length, 'Adding message:', message);
        const updatedMessages = [...prevMessages, message]
        console.log('New messages array:', updatedMessages.length, updatedMessages);
        chatStorage.updateSessionMessages(sessionId, updatedMessages)
        console.log('Updated localStorage, returning new messages array');
        return updatedMessages
      })
    },
    [currentSession],
  )

  // Update multiple messages (for batch updates)
  const updateMessages = useCallback(
    (newMessages: ChatMessage[]) => {
      if (!currentSession) return

      setMessages(newMessages)
      chatStorage.updateSessionMessages(currentSession.id, newMessages)
    },
    [currentSession],
  )

  // Clear current session
  const clearSession = useCallback(() => {
    setCurrentSession(null)
    setMessages([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("healing-chat-current")
    }
  }, [])

  return {
    currentSession,
    messages,
    isLoading,
    createSession,
    loadSession,
    addMessage,
    updateMessages,
    clearSession,
  }
}
