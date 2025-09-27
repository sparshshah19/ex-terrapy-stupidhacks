// Pre-made conversation responses for each mode
export const FALLBACK_RESPONSES = {
  therapy: [
    {
      text: "Belly, I hear you. What you're feeling is valid — you don't have to hold it in. What's the biggest thing on your mind right now?",
      followUps: [
        "Do you feel like you've been able to fully process what happened between you two?",
        "What's one thing you wish Jeremiah understood about how you feel right now?"
      ]
    },
    {
      text: "I get it, this is heavy. It's okay to not have it all figured out right now. What part of this is hurting you the most?",
      followUps: [
        "What do you think would help you feel just a little lighter tonight?",
        "If Conrad or Jeremiah were here listening, what would you say first?"
      ]
    },
    {
      text: "Talking about this takes courage. You're doing better than you think. Where do you feel this most — in your heart, or in your head?",
      followUps: [
        "Do you want to vent more about the last conversation you had with him?",
        "What's one memory that's been replaying in your mind lately?"
      ]
    }
  ],

  blunt: [
    {
      text: "Jeremiah would just tell you straight — stop overcomplicating this. You know what you want, Belly. Why are you scared to say it?",
      followUps: [
        "So what's stopping you from texting him right now?",
        "Would you actually be happy if you got the answer you're looking for?"
      ]
    },
    {
      text: "Look, you can't control Jeremiah or Conrad — only you. So what's your move, Belly?",
      followUps: [
        "Do you think you're holding on for him, or for who he used to be?",
        "What happens if you just let yourself pick a side and stick with it?"
      ]
    },
    {
      text: "Cut the drama — this love triangle isn't as complicated as you think. Who do you *really* want?",
      followUps: [
        "If you had to choose right now, who's name comes to mind first?",
        "How much of this is about them, and how much is about you figuring yourself out?"
      ]
    }
  ],

  closure: [
    {
      text: "Hey… yeah, this feels weird talking again. But maybe we both need this, Belly. I've been thinking about us too, honestly.",
      followUps: [
        "Do you think hearing his side would actually help you heal?",
        "If you could ask him just one honest question, what would it be?"
      ]
    },
    {
      text: "I know things ended messy. We both made mistakes — I wish we'd done it differently. But maybe this is how it had to be.",
      followUps: [
        "Do you think you're ready to forgive him — or yourself?",
        "What would closure even look like for you right now?"
      ]
    },
    {
      text: "Sometimes I wonder what would've happened if we tried again. But we can't go back, can we?",
      followUps: [
        "Would you even want to go back if you could?",
        "What would future-you want you to do about this right now?"
      ]
    }
  ]
};

export function getRandomFallbackResponse(mode: 'therapy' | 'blunt' | 'closure'): { text: string; followUps: string[] } {
  const responses = FALLBACK_RESPONSES[mode];
  return responses[Math.floor(Math.random() * responses.length)];
}