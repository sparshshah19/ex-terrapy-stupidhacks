"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreHorizontal, Download, Trash2, Calendar, MessageCircle } from "lucide-react"
import { chatStorage, type ChatSession } from "@/lib/chat-storage"
import { personas } from "@/lib/personas"

interface HistoryPanelProps {
  onSessionSelect: (session: ChatSession) => void
  currentSessionId?: string
}

export function HistoryPanel({ onSessionSelect, currentSessionId }: HistoryPanelProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([])
  const [selectedPersona, setSelectedPersona] = useState<"all" | "blunt" | "therapy" | "closure">("all")

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    filterSessions()
  }, [sessions, searchQuery, selectedPersona])

  const loadSessions = () => {
    const loadedSessions = chatStorage.getSessions()
    setSessions(loadedSessions)
  }

  const filterSessions = () => {
    let filtered = sessions

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = chatStorage.searchSessions(searchQuery)
    }

    // Filter by persona
    if (selectedPersona !== "all") {
      filtered = filtered.filter((session) => session.persona === selectedPersona)
    }

    // Sort by most recent
    filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

    setFilteredSessions(filtered)
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this chat session?")) {
      chatStorage.deleteSession(sessionId)
      loadSessions()
    }
  }

  const handleExportSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const exportData = chatStorage.exportSession(sessionId)
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-session-${sessionId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPersona === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPersona("all")}
          >
            All
          </Button>
          {Object.values(personas).map((persona) => (
            <Button
              key={persona.id}
              variant={selectedPersona === persona.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPersona(persona.id)}
            >
              {persona.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">
              {searchQuery ? "No conversations found matching your search." : "No chat history yet."}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <Card
              key={session.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentSessionId === session.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onSessionSelect(session)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={personas[session.persona].avatar || "/placeholder.svg"} />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm truncate">{session.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {personas[session.persona].name}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(session.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e) => handleExportSession(session.id, e)}>
                        <Download className="mr-2 h-3 w-3" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              {session.lastMessage && (
                <CardContent className="pt-0">
                  <CardDescription className="text-xs line-clamp-2">{session.lastMessage}</CardDescription>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {session.messageCount} message{session.messageCount !== 1 ? "s" : ""}
                    </span>
                    {currentSessionId === session.id && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
