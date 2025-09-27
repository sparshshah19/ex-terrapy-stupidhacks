"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { personas } from "@/lib/personas"
import { MessageCircle, Brain, Heart, Sparkles } from "lucide-react"

interface PersonaSelectorProps {
  currentPersona: "blunt" | "therapy" | "closure"
  onPersonaChange: (persona: "blunt" | "therapy" | "closure") => void
}

const personaIcons = {
  blunt: MessageCircle,
  therapy: Brain,
  closure: Heart,
}

export function PersonaSelector({ currentPersona, onPersonaChange }: PersonaSelectorProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
          <Avatar className="h-5 w-5">
            <AvatarImage src={personas[currentPersona].avatar || "/placeholder.svg"} />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <span>{personas[currentPersona].name}</span>
          <Sparkles className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose Your AI Companion</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {Object.values(personas).map((persona) => {
            const Icon = personaIcons[persona.id]
            const isSelected = currentPersona === persona.id
            return (
              <Card
                key={persona.id}
                className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
                onClick={() => onPersonaChange(persona.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      {isSelected && (
                        <Badge variant="default" className="mt-1">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">{persona.description}</CardDescription>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Response Style</h4>
                      <p className="text-xs text-muted-foreground">{persona.responseStyle.tone}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Sample Responses</h4>
                      <div className="space-y-2">
                        {persona.responseStyle.examples.slice(0, 2).map((example, index) => (
                          <div key={index} className="text-xs p-2 bg-muted rounded text-muted-foreground italic">
                            "{example}"
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className="w-full"
                    onClick={() => onPersonaChange(persona.id)}
                  >
                    {isSelected ? "Currently Active" : "Select This Persona"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
