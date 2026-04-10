"use client"

import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generate80GReceipt, numToWords } from "@/lib/utils/generateReceipt"
import { useState } from "react"

interface DonorReceiptButtonProps {
  donation: any
}

export default function DonorReceiptButton({ donation }: DonorReceiptButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = () => {
    setLoading(true)
    try {
      const org = donation.campaigns?.organizations

      generate80GReceipt({
        receiptNumber: `PF-${new Date(donation.created_at).getFullYear()}-${donation.id.slice(0, 6).toUpperCase()}`,
        date: new Date(donation.created_at).toLocaleDateString("en-IN"),
        donorName: donation.donor_name,
        donorPan: donation.donor_pan || undefined,
        donorEmail: donation.donor_email || undefined,
        amount: donation.amount,
        amountWords: numToWords(donation.amount),
        paymentMode: "UPI / Bank Transfer",
        utr: donation.upi_utr,
        campaignName: donation.campaigns?.title || "General Fund",
        ngoContext: {
          name: org?.name || "Verified NGO Partner",
          address: org?.address || "India",
          pan: org?.pan_number || "PENDING PAN",
          registration_detail: org?.registration_number || "PENDING REG"
        }
      })
    } catch (error) {
      console.error("Failed to generate receipt:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 h-8 text-[10px] font-bold uppercase tracking-wider"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <Download className="h-3 w-3 mr-1" />
      )}
      Receipt
    </Button>
  )
}
