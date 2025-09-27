"use client"

import { useState, useCallback } from "react"

export interface OCRResult {
  text: string
  confidence: number
  isProcessing: boolean
  error?: string
}

export function useOCR() {
  const [results, setResults] = useState<Map<string, OCRResult>>(new Map())

  const processImage = useCallback(
    async (file: File): Promise<OCRResult> => {
      const fileId = `${file.name}-${file.size}-${file.lastModified}`

      // Check if already processed
      const existingResult = results.get(fileId)
      if (existingResult && !existingResult.isProcessing) {
        return existingResult
      }

      // Set processing state
      const processingResult: OCRResult = {
        text: "",
        confidence: 0,
        isProcessing: true,
      }

      setResults((prev) => new Map(prev).set(fileId, processingResult))

      try {
        // Simulate OCR processing with mock text extraction
        // In a real implementation, this would use a service like Tesseract.js or cloud OCR
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Mock OCR results based on file type and common screenshot patterns
        const mockText = generateMockOCRText(file.name)

        const result: OCRResult = {
          text: mockText,
          confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
          isProcessing: false,
        }

        setResults((prev) => new Map(prev).set(fileId, result))
        return result
      } catch (error) {
        const errorResult: OCRResult = {
          text: "",
          confidence: 0,
          isProcessing: false,
          error: error instanceof Error ? error.message : "OCR processing failed",
        }

        setResults((prev) => new Map(prev).set(fileId, errorResult))
        return errorResult
      }
    },
    [results],
  )

  const getResult = useCallback(
    (file: File): OCRResult | undefined => {
      const fileId = `${file.name}-${file.size}-${file.lastModified}`
      return results.get(fileId)
    },
    [results],
  )

  const clearResults = useCallback(() => {
    setResults(new Map())
  }, [])

  return {
    processImage,
    getResult,
    clearResults,
  }
}

// Mock OCR text generation for demonstration
function generateMockOCRText(filename: string): string {
  const lowerFilename = filename.toLowerCase()

  if (lowerFilename.includes("whatsapp") || lowerFilename.includes("message")) {
    return `Sarah: Hey, can we talk?
You: What about?
Sarah: I think we need to take a break
You: Are you serious right now?
Sarah: I've been thinking about this for a while
You: This is so sudden
Sarah: I'm sorry, I just need some space
You: I don't understand what I did wrong
Sarah: It's not about you, it's about me
You: That's such a cliche
Sarah: I know, but it's true
You: So what now?
Sarah: I think we should stop talking for a while
You: This hurts so much
Sarah: I'm sorry`
  }

  if (lowerFilename.includes("instagram") || lowerFilename.includes("insta")) {
    return `@sarah_j posted a story
"Living my best life ✨"
*photo of her at a party*

@sarah_j posted a photo
"New beginnings 🌟"
*photo with someone new*
❤️ 127 likes
View all 23 comments
@friend1: You look so happy!
@friend2: Glowing! ✨`
  }

  if (lowerFilename.includes("text") || lowerFilename.includes("sms")) {
    return `Messages with Sarah

Today 2:14 PM
You: I miss you
Read 2:15 PM

Today 8:30 PM  
You: Can we please just talk?
Read 8:31 PM

Yesterday 11:45 AM
You: I saw your post, you look happy
Read 11:46 AM

Yesterday 6:22 PM
You: I'm sorry for whatever I did
Read 6:23 PM`
  }

  // Default generic text
  return `This appears to be a screenshot containing text messages or social media content. The text quality suggests this might be from a messaging app or social platform. Some portions may be unclear due to image resolution or compression.

Key visible elements:
- Conversation thread or post
- Timestamps visible
- Multiple participants or interactions
- Emotional content detected

Note: OCR confidence may vary based on image quality and text clarity.`
}
