"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { OnboardingModal, type OnboardingData } from "@/components/onboarding-modal"
import { ChatCanvas } from "@/components/chat-canvas"
import { HistoryPanel } from "@/components/history-panel"
import { ImageUploadPanel } from "@/components/image-upload-panel"
import { useChatSession } from "@/hooks/use-chat-session"
import { Heart, MessageCircle, Users, Sparkles, HeartCrack, Zap } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"chat" | "history" | "upload">("chat")
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [persona, setPersona] = useState<"blunt" | "therapy" | "closure">("blunt")
  const [safeMode, setSafeMode] = useState(false)
  const [pendingInsertText, setPendingInsertText] = useState<string>("")
  const [showNoExModal, setShowNoExModal] = useState(false)

  const { currentSession, messages, isLoading, createSession, loadSession, clearSession } = useChatSession()

  // Debug messages updates in main component
  console.log('HomePage: currentSession:', currentSession?.id, 'messages count:', messages.length);

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log("Starting onboarding completion with data:", data);
    const newSession = createSession(data, data.mode)
    console.log("Created session:", newSession);
    setPersona(data.mode)
    setShowOnboarding(false)
    setActiveTab("chat")
    console.log("Onboarding completed:", data)
  }

  const handleNewChat = () => {
    setShowOnboarding(true)
  }

  const handleTabChange = (tab: "chat" | "history" | "upload") => {
    if (tab === "history") {
      setShowOnboarding(true)
      return
    }
    setActiveTab(tab)
  }

  const handleInsertTextFromUpload = (text: string) => {
    if (currentSession) {
      setPendingInsertText(text)
      setActiveTab("chat")
    } else {
      // Store text and start onboarding
      setPendingInsertText(text)
      setShowOnboarding(true)
    }
  }

  const handleNoExClick = () => {
    setShowNoExModal(true)
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your emotional baggage...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case "chat":
        if (!currentSession) {
          return (
            <div className="max-w-4xl mx-auto py-8 space-y-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Heart className="h-12 w-12 text-primary" />
                  <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    exTerrapy
                  </h1>
                </div>
                <p className="text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
                  The world's most questionably helpful AI for processing your romantic disasters. Because sometimes you
                  need a robot to tell you what your friends are too nice to say.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-6 text-center space-y-4">
                    <Zap className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold text-lg">Brutally Honest AI</h3>
                    <p className="text-muted-foreground text-sm">
                      Choose your fighter: Savage Best Friend, Generic Therapist, or Dramatic Poet. Each one will judge
                      your life choices differently.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-6 text-center space-y-4">
                    <HeartCrack className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold text-lg">Questionably Safe</h3>
                    <p className="text-muted-foreground text-sm">
                      We removed all the crisis resources because this is a hackathon and we're going for "most useless
                      app" award.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-6 text-center space-y-4">
                    <Sparkles className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold text-lg">Screenshot Stalking</h3>
                    <p className="text-muted-foreground text-sm">
                      Upload screenshots of your ex's texts so our AI can analyze how badly you fumbled the bag.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center space-y-6">
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Badge variant="secondary" className="px-3 py-1">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Questionable Advice
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    Multiple Personalities
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <HeartCrack className="h-3 w-3 mr-1" />
                    Emotional Damage
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleNewChat} size="lg" className="px-8">
                    Start Your Emotional Spiral
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("upload")} size="lg" className="px-8">
                    Upload Your L's
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  exTerrapy is not responsible for any additional emotional damage caused by our brutally honest AI.
                  Side effects may include: reality checks, ego death, and the sudden urge to block your ex.
                </p>
              </div>
            </div>
          )
        }

        return (
          <ChatCanvas
            persona={persona}
            onPersonaChange={setPersona}
            safeMode={safeMode}
            onSafeModeChange={setSafeMode}
            session={currentSession}
            messages={messages}
            pendingText={pendingInsertText}
            onTextInserted={() => setPendingInsertText("")}
          />
        )

      case "history":
        return (
          <div className="max-w-4xl mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Chat History</h2>
                <p className="text-muted-foreground">Your previous conversations and sessions</p>
              </div>
              <Button onClick={handleNewChat}>New Chat</Button>
            </div>
            <HistoryPanel onSessionSelect={loadSession} currentSessionId={currentSession?.id} />
          </div>
        )

      case "upload":
        return (
          <div className="max-w-4xl mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Upload Images</h2>
                <p className="text-muted-foreground">
                  Upload screenshots and extract text for analysis in your conversations
                </p>
              </div>
              <Button onClick={handleNewChat}>New Chat</Button>
            </div>
            <ImageUploadPanel onInsertText={handleInsertTextFromUpload} />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} onNoExClick={handleNoExClick} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{renderContent()}</main>

      <OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} onComplete={handleOnboardingComplete} />

      {showNoExModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center space-y-4">
              <HeartCrack className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Don't Have an Ex?</h3>
              <p className="text-muted-foreground">
                Congratulations! You've achieved what the rest of us are trying to get over. Maybe try a dating app
                first, then come back when you need emotional support? 💀
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNoExModal(false)} className="flex-1">
                  I'll Be Back
                </Button>
                <Button
                  onClick={() => {
                    setShowNoExModal(false)
                    window.open("https://tinder.com", "_blank")
                  }}
                  className="flex-1"
                >
                  Find Someone to Disappoint Me
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
