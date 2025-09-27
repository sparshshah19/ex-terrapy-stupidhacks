"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, ImageIcon, Clipboard, Copy, Share, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { PersonaSelector } from "@/components/persona-selector"
import { SafetyBanner } from "@/components/safety-banner"
import { personas, getPersonaResponse, analyzeMessageSentiment } from "@/lib/personas"
import { safetyChecker, type SafetyResult } from "@/lib/safety-checker"
import { useChatSession } from "@/hooks/use-chat-session"
import type { ChatSession, ChatMessage } from "@/lib/chat-storage"
import { getRandomFallbackResponse } from "@/lib/fallback-responses"

interface ChatCanvasProps {
  persona: "blunt" | "therapy" | "closure"
  onPersonaChange: (persona: "blunt" | "therapy" | "closure") => void
  safeMode: boolean
  onSafeModeChange: (enabled: boolean) => void
  session: ChatSession
  messages: ChatMessage[]
  pendingText?: string
  onTextInserted?: () => void
}

const templates = {
  short: "Keep it brief",
  harsh: "Give it to me straight",
  gentle: "Be gentle with me",
}

export function ChatCanvas({
  persona,
  onPersonaChange,
  safeMode,
  onSafeModeChange,
  session,
  messages: messagesFromProps,
  pendingText,
  onTextInserted,
}: ChatCanvasProps) {
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [safetyResult, setSafetyResult] = useState<SafetyResult | null>(null)
  const [showSafetyBanner, setShowSafetyBanner] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Use the hook directly to get the most up-to-date messages
  const { addMessage, messages: messagesFromHook } = useChatSession()
  
  // Use messages from hook if available, fallback to props
  const messages = messagesFromHook.length > 0 ? messagesFromHook : messagesFromProps
  
  console.log('ChatCanvas render - messagesFromProps:', messagesFromProps.length, 'messagesFromHook:', messagesFromHook.length, 'using:', messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    console.log('ChatCanvas messages changed:', messages.length, messages);
    scrollToBottom()
  }, [messages])

  // Force scroll to bottom when new messages arrive
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      scrollToBottom()
    })
    return () => cancelAnimationFrame(timer)
  }, [messages.length])

  // Handle pending text insertion from image upload
  useEffect(() => {
    if (pendingText && pendingText.trim()) {
      setInputValue((prev) => {
        const newValue = prev ? `${prev}\n\n${pendingText}` : pendingText
        return newValue
      })
      onTextInserted?.()
      textareaRef.current?.focus()
    }
  }, [pendingText, onTextInserted])

  // Initialize with greeting if no messages (simplified version)
  useEffect(() => {
    console.log('Greeting useEffect triggered. Messages length:', messages.length, 'Session ID:', session?.id, 'Persona:', persona);
    // Only add greeting if we have a session, no messages, and the session is not empty
    if (session && session.id && messages.length === 0) {
      console.log('Adding greeting message for persona:', persona);
      // Use simple greeting to avoid API calls during initialization
      const greetingMessages = {
        therapy: "Hey there! 👋 I'm here to support you through whatever's on your mind. What's going on?",
        blunt: "Alright, what's the tea? ☕ I'm here to give you the brutal truth you probably need to hear. What's up?",
        closure: "hey... it's been a while. i wasn't sure if we'd ever talk again but here we are. what's on your mind?"
      };

      const greetingMessage: ChatMessage = {
        id: "greeting-" + Date.now(),
        content: greetingMessages[persona],
        sender: "ai",
        timestamp: new Date(),
        persona: persona,
        safety: { flagged: false },
      }
      console.log('Created greeting message:', greetingMessage);
      addMessage(greetingMessage)
      console.log('Greeting message added to session');
    } else {
      console.log('Skipping greeting. Session:', !!session, 'Session ID:', session?.id, 'Messages exist:', messages.length > 0);
    }
  }, [session?.id, persona, messages.length, addMessage])

  // Check message safety as user types
  useEffect(() => {
    if (inputValue.trim()) {
      const result = safetyChecker.checkMessage(inputValue)
      setSafetyResult(result)
      setShowSafetyBanner(!result.isSafe)
    } else {
      setSafetyResult(null)
      setShowSafetyBanner(false)
    }
  }, [inputValue])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Final safety check
    const finalSafetyCheck = safetyChecker.checkMessage(inputValue)
    if (finalSafetyCheck.shouldBlock) {
      setSafetyResult(finalSafetyCheck)
      setShowSafetyBanner(true)
      return
    }

    const sentiment = analyzeMessageSentiment(inputValue)
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      sentiment,
    }

    // Add user message immediately for instant feedback
    console.log('Adding user message:', userMessage);
    addMessage(userMessage)
    const currentInput = inputValue
    setInputValue("")
    setSafetyResult(null)
    setShowSafetyBanner(false)
    setIsTyping(true)

    // Make API call to get real AI response
    try {
      console.log('Making API call with:', { mode: persona, inputText: currentInput, safeMode });
      
      const response = await fetch('/api/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: persona,
          inputText: currentInput,
          consent: true,
          safeMode: safeMode,
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.aiText || "I'm having trouble responding right now. Please try again.",
        sender: "ai",
        timestamp: new Date(),
        persona,
        safety: data.safety || { flagged: false },
      }
      
      console.log('Adding AI response from API:', aiResponse);
      addMessage(aiResponse)
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Use fallback response when API fails
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: getRandomFallbackResponse(persona),
        sender: "ai",
        timestamp: new Date(),
        persona,
        safety: { flagged: false },
      }
      console.log('Adding fallback response due to API error:', aiResponse);
      addMessage(aiResponse)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTemplateClick = (template: keyof typeof templates) => {
    setInputValue((prev) => `${prev} [${templates[template]}]`.trim())
    textareaRef.current?.focus()
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handlePasteScreenshot = () => {
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto" id="main-content">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={personas[persona].avatar || "/placeholder.svg"} />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <PersonaSelector currentPersona={persona} onPersonaChange={onPersonaChange} />
            <p className="text-xs text-muted-foreground">{session.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant={safeMode ? "default" : "outline"} size="sm" onClick={() => onSafeModeChange(!safeMode)}>
            Safe Mode {safeMode ? "On" : "Off"}
          </Button>
        </div>
      </div>

      {/* Safety Banner */}
      {showSafetyBanner && safetyResult && (
        <div className="px-4 pt-4">
          <SafetyBanner safetyResult={safetyResult} onDismiss={() => setShowSafetyBanner(false)} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start a conversation! (Debug: messages.length = {messages.length})
          </div>
        )}
        {(() => {
          console.log('Rendering messages, count:', messages.length, messages);
          return null;
        })()}
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start space-x-3",
              message.sender === "user" ? "flex-row-reverse space-x-reverse" : "",
            )}
            role="article"
            aria-label={`${message.sender === "user" ? "Your" : "AI"} message at ${message.timestamp.toLocaleTimeString()}`}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={
                  message.sender === "user"
                    ? "/placeholder.svg?height=32&width=32&query=user+avatar"
                    : personas[message.persona || persona].avatar
                }
                alt={message.sender === "user" ? "Your avatar" : "AI avatar"}
              />
              <AvatarFallback>{message.sender === "user" ? "U" : "AI"}</AvatarFallback>
            </Avatar>

            <div
              className={cn("flex-1 max-w-[80%] space-y-2", message.sender === "user" ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-3 text-sm",
                  message.sender === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted",
                )}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <time dateTime={message.timestamp.toISOString()}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </time>
                {message.persona && (
                  <Badge variant="outline" className="text-xs">
                    {personas[message.persona].name}
                  </Badge>
                )}
                {message.sentiment && message.sender === "user" && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      message.sentiment === "positive" && "text-green-600",
                      message.sentiment === "negative" && "text-red-600",
                    )}
                  >
                    {message.sentiment}
                  </Badge>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      aria-label={`Message options for ${message.sender} message`}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => copyMessage(message.content)}>
                      <Copy className="mr-2 h-3 w-3" />
                      Copy message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="mr-2 h-3 w-3" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start space-x-3" aria-live="polite" aria-label="AI is typing">
            <Avatar className="h-8 w-8">
              <AvatarImage src={personas[persona].avatar || "/placeholder.svg"} alt="AI avatar" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg px-4 py-3">
              <div className="flex space-x-1" aria-label="Typing indicator">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card/50 p-4">
        <div className="space-y-3">
          {/* Quick Templates */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick response templates">
            {Object.entries(templates).map(([key, label]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handleTemplateClick(key as keyof typeof templates)}
                className="text-xs"
                aria-label={`Insert template: ${label}`}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[60px] max-h-[120px] resize-none pr-20"
                aria-label="Message input"
                disabled={safetyResult?.shouldBlock}
              />
              <div className="absolute right-2 bottom-2 flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Upload image"
                  aria-label="Upload image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handlePasteScreenshot}
                  title="Paste screenshot"
                  aria-label="Paste screenshot"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || safetyResult?.shouldBlock}
              className="h-[60px] px-6"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
