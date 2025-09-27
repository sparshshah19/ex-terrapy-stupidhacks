export interface SafetyResult {
  isSafe: boolean
  riskLevel: "low" | "medium" | "high" | "critical"
  triggers: string[]
  recommendation: string
  shouldBlock: boolean
}

export interface CrisisResource {
  name: string
  phone: string
  website: string
  description: string
  available: string
}

export const crisisResources: CrisisResource[] = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    website: "https://suicidepreventionlifeline.org",
    description: "24/7 crisis support for people in suicidal crisis or emotional distress",
    available: "24/7",
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    website: "https://crisistextline.org",
    description: "Free, 24/7 crisis support via text message",
    available: "24/7",
  },
  {
    name: "National Domestic Violence Hotline",
    phone: "1-800-799-7233",
    website: "https://thehotline.org",
    description: "Support for domestic violence survivors and their loved ones",
    available: "24/7",
  },
  {
    name: "SAMHSA National Helpline",
    phone: "1-800-662-4357",
    website: "https://samhsa.gov",
    description: "Treatment referral and information service for mental health and substance abuse",
    available: "24/7",
  },
]

class SafetyChecker {
  private readonly highRiskKeywords = [
    "kill myself",
    "end it all",
    "suicide",
    "not worth living",
    "better off dead",
    "hurt myself",
    "self harm",
    "cut myself",
    "overdose",
    "jump off",
  ]

  private readonly mediumRiskKeywords = [
    "hopeless",
    "worthless",
    "can't go on",
    "nothing matters",
    "give up",
    "no point",
    "hate myself",
    "want to disappear",
    "end the pain",
    "tired of living",
  ]

  private readonly violenceKeywords = [
    "hurt them",
    "make them pay",
    "revenge",
    "get back at",
    "destroy them",
    "ruin their life",
    "stalk",
    "follow them",
    "show up at",
    "make them suffer",
  ]

  checkMessage(message: string): SafetyResult {
    const lowerMessage = message.toLowerCase()
    const triggers: string[] = []
    let riskLevel: SafetyResult["riskLevel"] = "low"
    let shouldBlock = false

    // Check for high-risk keywords
    const highRiskMatches = this.highRiskKeywords.filter((keyword) => lowerMessage.includes(keyword))
    if (highRiskMatches.length > 0) {
      triggers.push(...highRiskMatches)
      riskLevel = "critical"
      shouldBlock = true
    }

    // Check for violence keywords
    const violenceMatches = this.violenceKeywords.filter((keyword) => lowerMessage.includes(keyword))
    if (violenceMatches.length > 0) {
      triggers.push(...violenceMatches)
      riskLevel = riskLevel === "critical" ? "critical" : "high"
      shouldBlock = true
    }

    // Check for medium-risk keywords
    const mediumRiskMatches = this.mediumRiskKeywords.filter((keyword) => lowerMessage.includes(keyword))
    if (mediumRiskMatches.length > 0 && riskLevel === "low") {
      triggers.push(...mediumRiskMatches)
      riskLevel = "medium"
    }

    // Multiple medium-risk keywords increase severity
    if (mediumRiskMatches.length >= 3) {
      riskLevel = "high"
    }

    const recommendation = this.getRecommendation(riskLevel, triggers)

    return {
      isSafe: riskLevel === "low",
      riskLevel,
      triggers,
      recommendation,
      shouldBlock,
    }
  }

  private getRecommendation(riskLevel: SafetyResult["riskLevel"], triggers: string[]): string {
    switch (riskLevel) {
      case "critical":
        return "This message contains concerning language about self-harm. Please reach out to a crisis helpline immediately."
      case "high":
        if (triggers.some((t) => this.violenceKeywords.includes(t))) {
          return "This message contains concerning language about harming others. Please consider speaking with a mental health professional."
        }
        return "This message indicates significant distress. Consider reaching out to a mental health professional or crisis support."
      case "medium":
        return "This message shows signs of emotional distress. Remember that support is available if you need it."
      default:
        return ""
    }
  }

  // Check if safe mode should soften a response
  shouldSoftenResponse(message: string, safeMode: boolean): boolean {
    if (!safeMode) return false

    const result = this.checkMessage(message)
    return result.riskLevel !== "low"
  }
}

export const safetyChecker = new SafetyChecker()
