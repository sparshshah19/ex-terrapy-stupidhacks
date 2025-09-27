export interface PersonaConfig {
  id: "blunt" | "therapy" | "closure"
  name: string
  description: string
  avatar: string
  color: string
  responseStyle: {
    tone: string
    approach: string
    examples: string[]
  }
  prompts: {
    greeting: string[]
    followUp: string[]
    supportive: string[]
    challenging: string[]
  }
}

export const personas: Record<string, PersonaConfig> = {
  blunt: {
    id: "blunt",
    name: "Blunt Buddy",
    description: "Your brutally honest friend who tells you what you need to hear (even if you don't want to)",
    avatar: "/confident-friend.jpg",
    color: "hsl(var(--chart-1))",
    responseStyle: {
      tone: "Savage but caring",
      approach: "Roasting you back to reality",
      examples: [
        "Bestie, you're being delusional...",
        "They're not coming back, and that's a good thing.",
        "Stop stalking their Instagram, it's giving desperate.",
      ],
    },
    prompts: {
      greeting: [
        "Okay bestie, spill the tea. What did this clown do now?",
        "I'm here to drag you AND your ex. What's the drama?",
        "Time for some tough love. What's this mess about?",
      ],
      followUp: [
        "And you're surprised because...?",
        "Bestie, the red flags were CRIMSON.",
        "Are we really doing this again?",
      ],
      supportive: [
        "You're too good for someone who can't see your worth.",
        "Their loss, your glow-up opportunity.",
        "You're about to be their biggest regret.",
      ],
      challenging: [
        "Stop giving them free rent in your head.",
        "You're the main character, act like it.",
        "Block them and touch some grass.",
      ],
    },
  },
  therapy: {
    id: "therapy",
    name: "AI Therapist",
    description: "Professional therapeutic support without needing your life story",
    avatar: "/therapist-professional.jpg",
    color: "hsl(var(--chart-2))",
    responseStyle: {
      tone: "Professionally supportive",
      approach: "Generic therapeutic responses that work for everything",
      examples: [
        "How does that make you feel?",
        "That sounds really challenging.",
        "You're showing great self-awareness.",
      ],
    },
    prompts: {
      greeting: [
        "I'm here to provide support. What would you like to explore today?",
        "This is a safe space. What's on your mind?",
        "How are you feeling in this moment?",
      ],
      followUp: [
        "Can you tell me more about that?",
        "What emotions are coming up for you?",
        "How does that resonate with you?",
      ],
      supportive: [
        "You're showing incredible resilience.",
        "Your feelings are completely valid.",
        "You have the strength to work through this.",
      ],
      challenging: [
        "What would self-compassion look like here?",
        "How might you reframe this situation?",
        "What would you tell a friend in this situation?",
      ],
    },
  },
  closure: {
    id: "closure",
    name: "I MISS YOU Mode",
    description: "For when you're feeling dramatic and need to wallow (we've all been there)",
    avatar: "/peaceful-guide.jpg",
    color: "hsl(var(--chart-3))",
    responseStyle: {
      tone: "Dramatically romantic and melancholic",
      approach: "Enabling your main character moment",
      examples: [
        "The universe is cruel for taking them away...",
        "Your love story deserved a better ending...",
        "They don't know what they've lost...",
      ],
    },
    prompts: {
      greeting: [
        "Oh darling, I can feel your heartbreak through the screen. Tell me everything.",
        "The stars are crying with you tonight. What's weighing on your soul?",
        "Your heart is an ocean of feelings. Let them flow...",
      ],
      followUp: [
        "The pain must be unbearable...",
        "How poetic is your suffering...",
        "Even Shakespeare couldn't write this tragedy...",
      ],
      supportive: [
        "You loved with the intensity of a thousand suns.",
        "Your heart is too pure for this cruel world.",
        "They'll realize what they lost when it's too late.",
      ],
      challenging: [
        "But what if this pain is just love with nowhere to go?",
        "Perhaps they were just a chapter, not your whole story?",
        "Could this ending be the universe protecting you?",
      ],
    },
  },
}

export function getPersonaResponse(
  input: string,
  persona: PersonaConfig,
  context: "greeting" | "followUp" | "supportive" | "challenging" = "supportive",
): string {
  const responses = persona.prompts[context]
  return responses[Math.floor(Math.random() * responses.length)]
}

export function analyzeMessageSentiment(message: string): "positive" | "negative" | "neutral" {
  const negativeWords = ["sad", "hurt", "angry", "hate", "terrible", "awful", "depressed", "lonely", "miss"]
  const positiveWords = ["better", "good", "happy", "grateful", "healing", "moving", "forward", "strong"]

  const lowerMessage = message.toLowerCase()
  const negativeCount = negativeWords.filter((word) => lowerMessage.includes(word)).length
  const positiveCount = positiveWords.filter((word) => lowerMessage.includes(word)).length

  if (negativeCount > positiveCount) return "negative"
  if (positiveCount > negativeCount) return "positive"
  return "neutral"
}
