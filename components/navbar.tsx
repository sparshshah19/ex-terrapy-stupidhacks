"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, History, Upload, Menu, Settings, LogOut, Heart, HeartCrack } from "lucide-react"
import { AccessibilityPanel, SkipToContent } from "@/components/accessibility-features"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavbarProps {
  activeTab: "chat" | "history" | "upload"
  onTabChange: (tab: "chat" | "history" | "upload") => void
  onNoExClick?: () => void
}

export function Navbar({ activeTab, onTabChange, onNoExClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: "chat" as const, label: "Chat", icon: MessageCircle },
    { id: "history" as const, label: "New Session", icon: History },
    { id: "upload" as const, label: "Upload Images", icon: Upload },
  ]

  return (
    <>
      <SkipToContent />
      <nav
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">exTerrapy</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1" role="tablist">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => onTabChange(tab.id)}
                    className="flex items-center space-x-2"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </Button>
                )
              })}
            </div>

            {/* User Menu and Accessibility */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onNoExClick}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground bg-transparent"
              >
                <HeartCrack className="h-4 w-4" />
                <span className="hidden sm:inline">Don't Have an Ex?</span>
                <span className="sm:hidden">No Ex?</span>
              </Button>

              <ThemeToggle />

              {/* Accessibility Panel */}
              <AccessibilityPanel />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
                      <AvatarFallback>💔</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-3" id="mobile-menu">
              <div className="flex flex-col space-y-1" role="tablist">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      onClick={() => {
                        onTabChange(tab.id)
                        setMobileMenuOpen(false)
                      }}
                      className="justify-start"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`${tab.id}-panel`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </Button>
                  )
                })}
                <Button
                  variant="ghost"
                  onClick={() => {
                    onNoExClick?.()
                    setMobileMenuOpen(false)
                  }}
                  className="justify-start text-muted-foreground"
                >
                  <HeartCrack className="h-4 w-4 mr-2" />
                  Don't Have an Ex?
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
