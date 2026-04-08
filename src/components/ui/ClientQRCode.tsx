"use client"

import { QRCodeSVG } from "qrcode.react"

interface ClientQRCodeProps {
  value: string
  size?: number
  className?: string
}

export function ClientQRCode({ value, size = 200, className = "" }: ClientQRCodeProps) {
  return (
    <div className={`flex items-center justify-center p-4 bg-white rounded-xl ${className}`}>
      <QRCodeSVG 
        value={value} 
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  )
}
