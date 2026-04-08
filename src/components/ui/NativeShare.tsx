"use client"

import { Share2 } from "lucide-react"
import { useState } from "react"

interface NativeShareProps {
  title: string
  text: string
  url: string
  className?: string
}

export function NativeShare({ title, text, url, className = "" }: NativeShareProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
      } catch (error) {
        console.error("Error sharing", error)
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${text} ${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center justify-center gap-2 font-semibold transition-all ${className}`}
    >
      <Share2 className="h-4 w-4" />
      {copied ? "Copied!" : "Share"}
    </button>
  )
}
