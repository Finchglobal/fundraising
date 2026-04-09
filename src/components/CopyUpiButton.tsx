"use client"

import { useState } from "react"
import { Copy, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function CopyUpiButton({ upiId, compact = false }: { upiId: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId)
      setCopied(true)
      toast.success("UPI ID copied!", { description: "Open your UPI app and paste in the 'Pay to' field." })
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("Copy failed", { description: "Please copy the UPI ID manually." })
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
          copied
            ? "bg-green-50 border-green-300 text-green-700"
            : "bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-700"
        }`}
      >
        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy UPI"}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-200 ${
        copied
          ? "bg-green-50 border-green-300 text-green-700"
          : "bg-white border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700"
      }`}
    >
      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "UPI ID Copied!" : "Copy UPI ID"}
    </button>
  )
}
