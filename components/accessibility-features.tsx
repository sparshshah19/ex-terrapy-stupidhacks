"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Settings, Eye, Type } from "lucide-react"

interface AccessibilitySettings {
  fontSize: number
  highContrast: boolean
  reducedMotion: boolean
  darkMode: boolean
  screenReaderOptimized: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
}

export function AccessibilityPanel() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
    darkMode: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    focusIndicators: true,
  })

  const [open, setOpen] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("healing-chat-accessibility")
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        setSettings(parsedSettings)
        applySettings(parsedSettings)
      } catch (error) {
        console.error("Failed to load accessibility settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage and apply them
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem("healing-chat-accessibility", JSON.stringify(updated))
    applySettings(updated)
  }

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement

    // Font size
    root.style.fontSize = `${settings.fontSize}px`

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }

    // Dark mode
    if (settings.darkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // Screen reader optimization
    if (settings.screenReaderOptimized) {
      root.classList.add("screen-reader-optimized")
    } else {
      root.classList.remove("screen-reader-optimized")
    }

    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add("enhanced-focus")
    } else {
      root.classList.remove("enhanced-focus")
    }
  }

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 16,
      highContrast: false,
      reducedMotion: false,
      darkMode: false,
      screenReaderOptimized: false,
      keyboardNavigation: true,
      focusIndicators: true,
    }
    updateSettings(defaultSettings)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
          <Settings className="h-4 w-4" />
          <span>Accessibility</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visual Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Visual Settings</span>
              </CardTitle>
              <CardDescription>Adjust visual elements for better readability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size: {settings.fontSize}px</Label>
                <Slider
                  id="fontSize"
                  min={12}
                  max={24}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSettings({ fontSize: value })}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highContrast">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch
                  id="highContrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme to reduce eye strain</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reducedMotion">Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <Switch
                  id="reducedMotion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Navigation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <span>Navigation & Interaction</span>
              </CardTitle>
              <CardDescription>Improve navigation and interaction accessibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="keyboardNavigation">Enhanced Keyboard Navigation</Label>
                  <p className="text-sm text-muted-foreground">Optimize for keyboard-only navigation</p>
                </div>
                <Switch
                  id="keyboardNavigation"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSettings({ keyboardNavigation: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="focusIndicators">Enhanced Focus Indicators</Label>
                  <p className="text-sm text-muted-foreground">Make focus states more visible</p>
                </div>
                <Switch
                  id="focusIndicators"
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) => updateSettings({ focusIndicators: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="screenReaderOptimized">Screen Reader Optimization</Label>
                  <p className="text-sm text-muted-foreground">Optimize interface for screen readers</p>
                </div>
                <Switch
                  id="screenReaderOptimized"
                  checked={settings.screenReaderOptimized}
                  onCheckedChange={(checked) => updateSettings({ screenReaderOptimized: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetSettings}>
              Reset to Defaults
            </Button>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Skip to content link for keyboard navigation
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
  )
}
