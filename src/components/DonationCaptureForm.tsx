"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, IndianRupee, Info, AlertCircle, Camera, UploadCloud } from "lucide-react"
import imageCompression from 'browser-image-compression';
import { toast } from "sonner"

// --- Validation helpers ---
const validators = {
  name: (v: string) => {
    if (!v || v.trim().length < 3) return "Full name must be at least 3 characters."
    if (/[0-9!@#$%^&*()]/.test(v)) return "Name should not contain numbers or special characters."
    return null
  },
  email: (v: string) => {
    if (!v) return null // optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address."
    return null
  },
  phone: (v: string) => {
    if (!v) return null // optional
    if (!/^[6-9]\d{9}$/.test(v.replace(/\s/g, ""))) return "Enter a valid 10-digit Indian mobile number."
    return null
  },
  pan: (v: string) => {
    if (!v) return null // optional
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v)) return "Invalid PAN format. Example: ABCDE1234F"
    return null
  },
  amount: (v: number | "") => {
    if (!v || v <= 0) return "Please enter the donation amount."
    if (Number(v) < 1) return "Minimum donation is ₹1."
    if (Number(v) > 1000000) return "Amount exceeds ₹10,00,000. Please contact us for large donations."
    return null
  },
  utr: (v: string) => {
    if (!v) return "Please enter your UTR number."
    const cleaned = v.trim()
    if (!/^\d{12}$/.test(cleaned)) return "UTR must be exactly 12 digits. Find it in your UPI app under Transaction Details."
    return null
  }
}

type FieldErrors = {
  name?: string | null
  email?: string | null
  phone?: string | null
  pan?: string | null
  amount?: string | null
  utr?: string | null
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 mt-1">
      <Info className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
      <p className="text-[11px] text-slate-400 leading-snug">{children}</p>
    </div>
  )
}

function FieldError({ error }: { error?: string | null }) {
  if (!error) return null
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />
      <p className="text-[11px] text-red-600 font-medium">{error}</p>
    </div>
  )
}

export default function DonationCaptureForm({ campaignId, triggerClassName }: { campaignId: string, triggerClassName?: string }) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [userId, setUserId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [pan, setPan] = useState("")
  const [amount, setAmount] = useState<number | "">("")
  const [utr, setUtr] = useState("")
  const [tip, setTip] = useState<number>(0)
  const [anonymous, setAnonymous] = useState(false)
  const [nameVisibility, setNameVisibility] = useState<"full" | "first_only" | "anonymous">("full")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Pre-fill user data if logged in
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setEmail(user.email || "")
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()
        if (profile?.full_name) setName(profile.full_name)
      }
    }
    getUser()
  }, [])

  const validateField = (field: keyof FieldErrors, value: any) => {
    const error = validators[field]?.(value) ?? null
    setFieldErrors(prev => ({ ...prev, [field]: error }))
    return error
  }

  const validateAll = (): boolean => {
    const errors: FieldErrors = {
      name: validators.name(name),
      email: validators.email(email),
      phone: validators.phone(phone),
      pan: validators.pan(pan),
      amount: validators.amount(amount),
      utr: validators.utr(utr),
    }
    setFieldErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!validateAll()) return

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id || userId

    // Determine public display name
    const publicName = nameVisibility === "anonymous" ? "Anonymous" :
      nameVisibility === "first_only" ? name.split(" ")[0] : name

    let proofUrl = null

    if (proofFile) {
      setUploading(true)
      try {
        const compressedFile = await imageCompression(proofFile, { maxSizeMB: 0.5, maxWidthOrHeight: 1200 });
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${campaignId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("donation-proofs")
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("donation-proofs")
          .getPublicUrl(fileName);
        
        proofUrl = publicUrl;
      } catch (err: any) {
        console.error("Upload failed:", err);
        setFormError("Failed to upload the payment screenshot. You can still submit without it.");
      }
      setUploading(false)
    }

    const { error } = await supabase.from("donations").insert({
      campaign_id: campaignId,
      donor_id: currentUserId,
      donor_name: publicName,
      donor_email: email || null,
      donor_phone: phone || null,
      donor_pan: pan || null,
      amount: amount,
      platform_tip: tip,
      upi_utr: utr.trim(),
      proof_url: proofUrl,
      is_anonymous: nameVisibility === "anonymous",
      status: "pending"
    })

    setLoading(false)

    if (!error) {
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setName(""); setEmail(""); setPhone(""); setPan("")
        setAmount(""); setUtr(""); setTip(0)
        setFieldErrors({})
      }, 3500)
    } else {
      if (error.message.includes("donations_upi_utr_key") || error.code === "23505") {
        setFormError("This UTR number has already been submitted. Each UPI payment has a unique 12-digit UTR — please double-check your payment app and enter the correct one.")
        toast.error("Duplicate UTR detected", { description: "This payment reference has already been recorded." })
      } else {
        setFormError("Something went wrong. Please try again.")
        toast.error("Submission failed", { description: error.message })
      }
    }
  }

  const baseAmount = Number(amount) || 0
  const tips = [
    { label: "10%", value: Math.round(baseAmount * 0.10) },
    { label: "15%", value: Math.round(baseAmount * 0.15) },
    { label: "No Tip", value: 0 }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName || "w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-6 text-lg rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20"}>
        <CheckCircle2 className="mr-2 h-5 w-5" /> I Have Paid
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl mb-2">Thank you!</DialogTitle>
            <DialogDescription className="text-base text-slate-600 px-4">
              Your UTR ({utr}) has been securely submitted. The NGO will verify this transfer and an official receipt will be generated once confirmed.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm your Contribution</DialogTitle>
              <DialogDescription>
                Enter the 12-digit UTR from your UPI app to verify your payment and receive your receipt.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {/* Amount + UTR */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="amount">Amount Sent <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <Input
                      id="amount" type="number" min="1" className={`pl-8 ${fieldErrors.amount ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                      placeholder="1000" value={amount}
                      onChange={e => { setAmount(Number(e.target.value)); validateField("amount", Number(e.target.value)) }}
                    />
                  </div>
                  <FieldError error={fieldErrors.amount} />
                  {Number(amount) > 100000 && !fieldErrors.amount && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      <p className="text-[11px] text-amber-600 font-medium">Unusually large amount. Please verify.</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="utr">
                    12-Digit UTR <span className="text-red-500">*</span>
                    <span className="text-[10px] text-slate-400 ml-1">({utr.replace(/\D/g, "").length}/12)</span>
                  </Label>
                  <Input
                    id="utr" placeholder="e.g. 312345678901" maxLength={12}
                    className={fieldErrors.utr ? 'border-red-400 focus-visible:ring-red-400' : ''}
                    value={utr}
                    onChange={e => { const v = e.target.value.replace(/\D/g, ""); setUtr(v); validateField("utr", v) }}
                  />
                  <FieldError error={fieldErrors.utr} />
                  {!fieldErrors.utr && <FieldHint>Open your UPI app → Transactions → tap the payment → find "Transaction ID" or "UTR"</FieldHint>}
                </div>
              </div>

              {/* Donor Name */}
              <div className="space-y-1">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name" placeholder="Name as per PAN (for tax receipt)"
                  className={fieldErrors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  value={name}
                  onChange={e => { setName(e.target.value); validateField("name", e.target.value) }}
                />
                <FieldError error={fieldErrors.name} />
              </div>

              {/* Name Visibility - 3 options per plan */}
              <div className="space-y-2">
                <Label className="text-sm">Display name publicly as</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "full", label: "Full Name" },
                    { value: "first_only", label: "First Name" },
                    { value: "anonymous", label: "Anonymous" },
                  ] as const).map(opt => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => setNameVisibility(opt.value)}
                      className={`text-xs py-2 px-3 rounded-lg border font-semibold transition-all ${nameVisibility === opt.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <FieldHint>Your full details are always shared with the NGO for receipts, regardless of display choice.</FieldHint>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email <span className="text-slate-400 text-xs">(optional)</span></Label>
                  <Input
                    id="email" type="email" placeholder="for@receipt.com"
                    className={fieldErrors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}
                    value={email}
                    onChange={e => { setEmail(e.target.value); validateField("email", e.target.value) }}
                  />
                  <FieldError error={fieldErrors.email} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Mobile <span className="text-slate-400 text-xs">(optional)</span></Label>
                  <Input
                    id="phone" type="tel" placeholder="9876543210" maxLength={10}
                    className={fieldErrors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}
                    value={phone}
                    onChange={e => { const v = e.target.value.replace(/\D/g, ""); setPhone(v); validateField("phone", v) }}
                  />
                  <FieldError error={fieldErrors.phone} />
                </div>
              </div>

              {/* PAN */}
              <div className="space-y-1">
                <Label htmlFor="pan">PAN Number <span className="text-slate-400 text-xs">(optional — required for 80G tax receipt)</span></Label>
                <Input
                  id="pan" placeholder="ABCDE1234F" maxLength={10}
                  className={`uppercase ${fieldErrors.pan ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  value={pan}
                  onChange={e => { const v = e.target.value.toUpperCase(); setPan(v); validateField("pan", v) }}
                />
                <FieldError error={fieldErrors.pan} />
                {!fieldErrors.pan && <FieldHint>Required to claim 50% tax deduction under Section 80G (if NGO is eligible).</FieldHint>}
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-teal-600" />
                  Upload Payment Screenshot <span className="text-slate-400 text-[10px] font-normal">(Optional but recommended)</span>
                </Label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center cursor-pointer relative ${proofFile ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200 hover:border-teal-400 bg-slate-50/50'}`}
                  onClick={() => document.getElementById('proof-upload')?.click()}
                >
                  <input 
                    id="proof-upload" type="file" accept="image/*" className="hidden" 
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  {proofFile ? (
                    <div className="text-center">
                      <div className="text-teal-600 font-bold text-xs truncate max-w-[200px] mb-1">{proofFile.name}</div>
                      <div className="text-[10px] text-teal-500 font-medium">(Click to change)</div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">Upload GPAY / Paytm screenshot</p>
                      <p className="text-[10px] text-slate-400 mt-1">Improves verification speed by 2x</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Tip */}
              <div className="pt-1">
                <Label className="block mb-1.5">Optional Platform Tip</Label>
                <p className="text-[11px] text-slate-500 mb-3">Tips help us keep PhilanthroForge completely free for verified NGOs. Zero upfront charges.</p>
                <div className="flex gap-2">
                  {tips.map((t, idx) => (
                    <Button
                      key={idx} type="button"
                      variant={tip === t.value ? "default" : "outline"}
                      className={`flex-1 text-xs h-9 ${tip === t.value && t.value !== 0 ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                      onClick={() => setTip(t.value)}
                    >
                      {t.label}{t.value > 0 ? ` (₹${t.value})` : ""}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl leading-relaxed flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={loading || uploading}>
                {loading || uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <IndianRupee className="h-4 w-4 mr-2" />}
                {uploading ? "Uploading proof..." : "Submit Payment Details"}
              </Button>

              <p className="text-center text-[10px] text-slate-400">
                Your information is securely stored and only shared with the verified NGO for receipt generation.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
