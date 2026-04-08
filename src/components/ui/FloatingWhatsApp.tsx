"use client"

import { MessageCircle } from "lucide-react"

interface FloatingWhatsAppProps {
  phoneNumber: string
  message?: string
}

export function FloatingWhatsApp({ phoneNumber, message = "Hi, I need some help with PhilanthroForge." }: FloatingWhatsAppProps) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 active:scale-95 transition-all duration-300"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
