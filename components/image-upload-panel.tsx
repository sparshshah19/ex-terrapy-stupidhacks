"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Upload,
  ImageIcon,
  FileText,
  Copy,
  Edit3,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Download,
  MessageSquare,
} from "lucide-react"
import { useOCR, type OCRResult } from "@/hooks/use-ocr"
import { cn } from "@/lib/utils"

interface UploadedImage {
  file: File
  preview: string
  ocrResult?: OCRResult
  editedText?: string
  isRedacted?: boolean
}

interface ImageUploadPanelProps {
  onInsertText: (text: string) => void
}

export function ImageUploadPanel({ onInsertText }: ImageUploadPanelProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState("")

  const { processImage, getResult } = useOCR()

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const imageFiles = fileArray.filter((file) => file.type.startsWith("image/"))

      for (const file of imageFiles) {
        const preview = URL.createObjectURL(file)
        const newImage: UploadedImage = { file, preview }

        setImages((prev) => [...prev, newImage])

        // Process OCR
        try {
          const ocrResult = await processImage(file)
          setImages((prev) => prev.map((img) => (img.file === file ? { ...img, ocrResult } : img)))
        } catch (error) {
          console.error("OCR processing failed:", error)
        }
      }
    },
    [processImage],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }, [])

  const startEditing = useCallback(
    (index: number) => {
      const image = images[index]
      const textToEdit = image.editedText || image.ocrResult?.text || ""
      setEditText(textToEdit)
      setEditingIndex(index)
    },
    [images],
  )

  const saveEdit = useCallback(() => {
    if (editingIndex !== null) {
      setImages((prev) => prev.map((img, i) => (i === editingIndex ? { ...img, editedText: editText } : img)))
      setEditingIndex(null)
      setEditText("")
    }
  }, [editingIndex, editText])

  const cancelEdit = useCallback(() => {
    setEditingIndex(null)
    setEditText("")
  }, [])

  const toggleRedaction = useCallback((index: number) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, isRedacted: !img.isRedacted } : img)))
  }, [])

  const insertTextToChat = useCallback(
    (index: number) => {
      const image = images[index]
      if (image.isRedacted) return

      const textToInsert = image.editedText || image.ocrResult?.text || ""
      if (textToInsert.trim()) {
        onInsertText(textToInsert)
      }
    },
    [images, onInsertText],
  )

  const copyText = useCallback(
    (index: number) => {
      const image = images[index]
      const textToCopy = image.editedText || image.ocrResult?.text || ""
      navigator.clipboard.writeText(textToCopy)
    },
    [images],
  )

  const exportText = useCallback(
    (index: number) => {
      const image = images[index]
      const textToExport = image.editedText || image.ocrResult?.text || ""
      const blob = new Blob([textToExport], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `extracted-text-${index + 1}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [images],
  )

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Screenshots</span>
          </CardTitle>
          <CardDescription>
            Upload screenshots of conversations, social media posts, or any text-based images for analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">Drop images here or click to upload</p>
                <p className="text-sm text-muted-foreground mt-1">Supports PNG, JPG, JPEG, WebP formats</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Images ({images.length})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium truncate">{image.file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {image.ocrResult?.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(image.ocrResult.confidence * 100)}% confidence
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => startEditing(index)}>
                            <Edit3 className="mr-2 h-3 w-3" />
                            Edit text
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleRedaction(index)}>
                            {image.isRedacted ? (
                              <>
                                <Eye className="mr-2 h-3 w-3" />
                                Show text
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-3 w-3" />
                                Hide text
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyText(index)}>
                            <Copy className="mr-2 h-3 w-3" />
                            Copy text
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportText(index)}>
                            <Download className="mr-2 h-3 w-3" />
                            Export text
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => removeImage(index)} className="text-destructive">
                            <Trash2 className="mr-2 h-3 w-3" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={image.preview || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(image.file.size / 1024)}KB
                      </Badge>
                    </div>
                  </div>

                  {/* OCR Status */}
                  {image.ocrResult?.isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        <span className="text-sm text-muted-foreground">Processing text...</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  )}

                  {/* OCR Error */}
                  {image.ocrResult?.error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                      <p className="text-sm text-destructive">Error processing image: {image.ocrResult.error}</p>
                    </div>
                  )}

                  {/* Extracted Text */}
                  {image.ocrResult?.text && !image.ocrResult.isProcessing && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Extracted Text</h4>
                        {image.isRedacted && (
                          <Badge variant="destructive" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>

                      {editingIndex === index ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[120px] text-sm"
                            placeholder="Edit the extracted text..."
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={saveEdit}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "p-3 bg-muted rounded text-sm font-mono whitespace-pre-wrap",
                            image.isRedacted && "blur-sm select-none",
                          )}
                        >
                          {image.editedText || image.ocrResult.text}
                        </div>
                      )}

                      {!image.isRedacted && (
                        <Button size="sm" onClick={() => insertTextToChat(index)} className="w-full">
                          <MessageSquare className="mr-2 h-3 w-3" />
                          Add to Chat
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
