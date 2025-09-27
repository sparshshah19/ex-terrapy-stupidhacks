"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, Camera, Heart, Brain, MessageCircle } from "lucide-react"

interface OnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: OnboardingData) => void
}

export interface OnboardingData {
  exName: string
  relationshipDuration: string
  description: string
  mode: "blunt" | "therapy" | "closure"
  avatar?: File
  screenshots?: File[]
  chatHistory?: string
  consent: boolean
}

const modes = [
  {
    id: "blunt" as const,
    name: "Blunt Friend",
    description: "Direct, honest feedback without sugar-coating",
    icon: MessageCircle,
  },
  {
    id: "therapy" as const,
    name: "AI Therapy",
    description: "Supportive roleplay with therapeutic techniques",
    icon: Brain,
  },
  {
    id: "closure" as const,
    name: "I MISS YOU",
    description: "Closure templates and healing-focused responses",
    icon: Heart,
  },
]

export function OnboardingModal({ open, onOpenChange, onComplete }: OnboardingModalProps) {
  const [formData, setFormData] = useState<OnboardingData>({
    exName: "",
    relationshipDuration: "",
    description: "",
    mode: "blunt",
    consent: false,
  })
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [avatar, setAvatar] = useState<File | null>(null)

  const handleSubmit = () => {
    if (!formData.consent) return

    onComplete({
      ...formData,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
      avatar: avatar || undefined,
    })
    onOpenChange(false)
  }

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScreenshots(Array.from(e.target.files))
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatar(e.target.files[0])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold text-balance">
            Before we start — give the AI some context
          </DialogTitle>
          <p className="text-muted-foreground text-balance">
            The more details you provide, the better I can help you navigate this.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exName">Ex's Name</Label>
                <Input
                  id="exName"
                  placeholder="Their name"
                  value={formData.exName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, exName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Relationship Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2 years, 6 months"
                  value={formData.relationshipDuration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, relationshipDuration: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Describe your ex's personality, habits, etc.</Label>
              <Textarea
                id="description"
                placeholder="Tell me about their personality, what they were like, any patterns you noticed..."
                className="min-h-[120px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload screenshots or chat history</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload screenshots</p>
                    {screenshots.length > 0 && (
                      <p className="text-xs text-primary mt-1">{screenshots.length} file(s) selected</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chatHistory">Or paste chat text</Label>
                  <Textarea
                    id="chatHistory"
                    placeholder="Paste conversation history here..."
                    className="min-h-[100px] resize-none"
                    value={formData.chatHistory || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, chatHistory: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload avatar for personalized responses (optional)</Label>
              <div className="relative w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {avatar ? avatar.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This image will be used for the chatbot avatar in your future conversations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <Label>Choose your AI persona</Label>
            <RadioGroup
              value={formData.mode}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, mode: value as OnboardingData["mode"] }))}
              className="space-y-3"
            >
              {modes.map((mode) => {
                const Icon = mode.icon
                return (
                  <div key={mode.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={mode.id} id={mode.id} className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <Label htmlFor={mode.id} className="font-medium">
                          {mode.name}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, consent: !!checked }))}
            />
            <div className="space-y-1">
              <Label htmlFor="consent" className="text-sm font-medium leading-relaxed">
                I consent to the app analyzing my uploads for the purpose of generating role-play and closure messages.
                I understand this is not a licensed therapist.
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!formData.consent}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Start Chat
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
