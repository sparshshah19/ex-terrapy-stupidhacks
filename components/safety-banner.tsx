"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Phone, ExternalLink, X, Heart } from "lucide-react"
import { crisisResources, type SafetyResult } from "@/lib/safety-checker"

interface SafetyBannerProps {
  safetyResult: SafetyResult
  onDismiss: () => void
}

export function SafetyBanner({ safetyResult, onDismiss }: SafetyBannerProps) {
  const [showResources, setShowResources] = useState(false)

  if (safetyResult.isSafe) return null

  const getBannerColor = () => {
    switch (safetyResult.riskLevel) {
      case "critical":
        return "border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
      case "high":
        return "border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
      case "medium":
        return "border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
      default:
        return "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
    }
  }

  const getIcon = () => {
    switch (safetyResult.riskLevel) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Heart className="h-4 w-4" />
    }
  }

  return (
    <>
      <Alert className={`mb-4 ${getBannerColor()}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            {getIcon()}
            <div className="flex-1">
              <AlertDescription className="text-sm">
                {safetyResult.recommendation}
                {safetyResult.riskLevel !== "low" && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto ml-2 text-current underline"
                    onClick={() => setShowResources(true)}
                  >
                    View crisis resources
                  </Button>
                )}
              </AlertDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-current" onClick={onDismiss}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Alert>

      <CrisisResourcesModal open={showResources} onOpenChange={setShowResources} />
    </>
  )
}

interface CrisisResourcesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CrisisResourcesModal({ open, onOpenChange }: CrisisResourcesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Crisis Support Resources</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
              If you're in immediate danger, please call emergency services (911) right away.
            </p>
            <p className="text-xs text-red-700 dark:text-red-300">
              The resources below provide professional support and are not a substitute for emergency medical care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crisisResources.map((resource, index) => (
              <Card key={index} className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{resource.name}</CardTitle>
                  <CardDescription className="text-sm">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span className="font-mono text-sm font-medium">{resource.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                      <a
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Visit website
                      </a>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Available: {resource.available}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Remember:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• You are not alone in this</li>
              <li>• Professional help is available 24/7</li>
              <li>• This AI is not a substitute for professional mental health care</li>
              <li>• Your feelings are valid and temporary</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Standalone trigger for crisis resources
export function CrisisResourcesTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-red-600 border-red-200">
        <Heart className="h-3 w-3 mr-1" />
        Crisis Resources
      </Button>
      <CrisisResourcesModal open={open} onOpenChange={setOpen} />
    </>
  )
}
