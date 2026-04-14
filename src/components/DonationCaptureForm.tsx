"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, IndianRupee, Info, AlertCircle, Camera, UploadCloud, Trash2, FileText } from "lucide-react"
import { useLang } from "@/components/LanguageSwitcher"
import imageCompression from 'browser-image-compression';
import { toast } from "sonner"

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

export default function DonationCaptureForm({ campaignId, triggerClassName, referrerId }: { campaignId: string, triggerClassName?: string, referrerId?: string | null }) {
  const supabase = createClient()
  const { t } = useLang()
  
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
  const [nameVisibility, setNameVisibility] = useState<"full" | "first_only" | "anonymous">("full")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const validators = useMemo(() => ({
    name: (v: string) => {
      if (!v || v.trim().length < 3) return t("donation_val_name")
      if (/[0-9!@#$%^&*()]/.test(v)) return t("donation_val_name_chars")
      return null
    },
    email: (v: string) => {
      if (!v) return null
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return t("donation_val_email")
      return null
    },
    phone: (v: string) => {
      if (!v) return null
      if (!/^[6-9]\d{9}$/.test(v.replace(/\s/g, ""))) return t("donation_val_phone")
      return null
    },
    pan: (v: string) => {
      if (!v) return null
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v)) return t("donation_val_pan")
      return null
    },
    amount: (v: number | "") => {
      if (!v || v <= 0) return t("donation_val_amount")
      if (Number(v) < 1) return t("donation_val_amount_min")
      if (Number(v) > 1000000) return t("donation_val_amount_max")
      return null
    },
    utr: (v: string) => {
      if (!v) return t("donation_val_utr")
      if (!/^\d{12}$/.test(v.trim())) return t("donation_val_utr")
      return null
    }
  }), [t])

  // Pre-fill user data if logged in
  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        setEmail(session.user.email || "")
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .single()
        if (profile?.full_name) setName(profile.full_name)
      }
    }
    getUser()
  }, [])

  const validateField = (field: keyof typeof validators, value: any) => {
    const error = (validators as any)[field]?.(value) ?? null
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
    const { data: { session } } = await supabase.auth.getSession()
    const currentUserId = session?.user?.id || userId

    const publicName = nameVisibility === "anonymous" ? (t("anonymous") || "Anonymous") :
      nameVisibility === "first_only" ? name.split(" ")[0] : name

    let proofUrl = null

    if (proofFile) {
      setUploading(true)
      try {
        const compressedFile = await imageCompression(proofFile, { maxSizeMB: 0.5, maxWidthOrHeight: 1200 });
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${campaignId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("donation-proofs")
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("donation-proofs")
          .getPublicUrl(fileName);
        
        proofUrl = publicUrl;
      } catch (err: any) {
        setFormError(t("donation_val_failed"));
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
      referrer_id: referrerId || null,
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
      if (error.code === "23505") {
        setFormError(t("donation_error_duplicate_utr"))
      } else {
        setFormError(t("donation_error_failed"))
      }
    }
  }

  const baseAmount = Number(amount) || 0
  const tips = [
    { label: "10%", value: Math.round(baseAmount * 0.10) },
    { label: "15%", value: Math.round(baseAmount * 0.15) },
    { label: t("no_tip") || "No Tip", value: 0 }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName || "w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-6 text-lg rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20"}>
        <CheckCircle2 className="mr-2 h-5 w-5" /> {t("already_paid")}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto rounded-3xl">
        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl mb-2 font-black tracking-tight">{t("donation_success_title")}</DialogTitle>
            <DialogDescription className="text-base text-slate-600 px-4 font-medium leading-relaxed">
              {t("donation_success_desc")}
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">{t("confirm_contribution")}</DialogTitle>
              <DialogDescription className="font-medium">
                {t("utr_desc")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="font-bold text-slate-700">{t("amount_sent")} <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <Input
                      id="amount" type="number" min="1" className={`pl-8 h-11 rounded-xl border-slate-200 focus:ring-teal-500 ${fieldErrors.amount ? 'border-red-400' : ''}`}
                      placeholder="1000" value={amount}
                      onChange={e => { setAmount(Number(e.target.value)); validateField("amount", Number(e.target.value)) }}
                    />
                  </div>
                  <FieldError error={fieldErrors.amount} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="utr" className="font-bold text-slate-700">
                    {t("utr_label")} <span className="text-red-500">*</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-mono">({utr.replace(/\D/g, "").length}/12)</span>
                  </Label>
                  <Input
                    id="utr" placeholder={t("donation_utr_placeholder")} maxLength={12}
                    className={`h-11 rounded-xl border-slate-200 focus:ring-teal-500 ${fieldErrors.utr ? 'border-red-400' : ''}`}
                    value={utr}
                    onChange={e => { const v = e.target.value.replace(/\D/g, ""); setUtr(v); validateField("utr", v) }}
                  />
                  <FieldError error={fieldErrors.utr} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-bold text-slate-700">{t("full_name")} <span className="text-red-500">*</span></Label>
                <Input
                  id="name" placeholder={t("full_name")}
                  className={`h-11 rounded-xl border-slate-200 focus:ring-teal-500 ${fieldErrors.name ? 'border-red-400' : ''}`}
                  value={name}
                  onChange={e => { setName(e.target.value); validateField("name", e.target.value) }}
                />
                <FieldError error={fieldErrors.name} />
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-700">{t("anonymous_display")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "full", label: t("full_name") },
                    { value: "first_only", label: t("first_name_only") },
                    { value: "anonymous", label: t("anonymous") },
                  ] as const).map(opt => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => setNameVisibility(opt.value)}
                      className={`text-[10px] py-2.5 px-3 rounded-xl border font-black uppercase tracking-widest transition-all ${nameVisibility === opt.value ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20' : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-bold text-slate-700">{t("email_label")} <span className="text-slate-400 text-[10px] font-normal">({t("optional")})</span></Label>
                  <Input
                    id="email" type="email" placeholder="for@receipt.com"
                    className={`h-11 rounded-xl border-slate-200 focus:ring-teal-500 ${fieldErrors.email ? 'border-red-400' : ''}`}
                    value={email}
                    onChange={e => { setEmail(e.target.value); validateField("email", e.target.value) }}
                  />
                  <FieldError error={fieldErrors.email} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="font-bold text-slate-700">{t("mobile_label")} <span className="text-slate-400 text-[10px] font-normal">({t("optional")})</span></Label>
                  <Input
                    id="phone" type="tel" placeholder="9876543210" maxLength={10}
                    className={`h-11 rounded-xl border-slate-200 focus:ring-teal-500 ${fieldErrors.phone ? 'border-red-400' : ''}`}
                    value={phone}
                    onChange={e => { const v = e.target.value.replace(/\D/g, ""); setPhone(v); validateField("phone", v) }}
                  />
                  <FieldError error={fieldErrors.phone} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pan" className="font-bold text-slate-700">{t("pan_label")} <span className="text-slate-400 text-[10px] font-normal">({t("optional")} — {t("pan_hint")})</span></Label>
                <Input
                  id="pan" placeholder="ABCDE1234F" maxLength={10}
                  className={`h-11 rounded-xl border-slate-200 focus:ring-teal-500 uppercase font-mono tracking-wider ${fieldErrors.pan ? 'border-red-400' : ''}`}
                  value={pan}
                  onChange={e => { const v = e.target.value.toUpperCase(); setPan(v); validateField("pan", v) }}
                />
                <FieldError error={fieldErrors.pan} />
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-teal-600" />
                  {t("upload_proof")} <span className="text-slate-400 text-[10px] font-normal">({t("optional")})</span>
                </Label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-5 transition-all flex flex-col items-center justify-center relative ${proofFile ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-teal-400 bg-slate-50/50'}`}
                >
                  <input 
                    id="proof-upload" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  {proofFile ? (
                    <div className="text-center w-full relative z-20">
                      <div className="flex items-center justify-center gap-2 mb-1 px-4 py-2.5 bg-white rounded-xl border border-teal-100 shadow-sm animate-in zoom-in-95">
                         <FileText className="h-4 w-4 text-teal-600 shrink-0" />
                         <span className="text-teal-700 font-bold text-xs truncate max-w-[180px]">{proofFile.name}</span>
                         <button 
                           type="button" 
                           onClick={(e) => { e.stopPropagation(); setProofFile(null); }}
                           className="ml-auto text-red-500 hover:text-red-700 p-1.5 transition-colors"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 relative z-20 pointer-events-none">
                      <UploadCloud className="h-8 w-8 text-teal-500 mb-2 mx-auto" />
                      <p className="text-xs text-slate-600 font-bold">{t("upload_proof")}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{t("upload_benefit")}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <Label className="block mb-2 font-bold text-slate-700">{t("platform_tip")}</Label>
                <div className="flex gap-2">
                  {tips.map((t_val, idx) => (
                    <Button
                      key={idx} type="button"
                      variant={tip === t_val.value ? "default" : "outline"}
                      className={`flex-1 text-[10px] h-10 rounded-xl font-black uppercase tracking-widest ${tip === t_val.value && t_val.value !== 0 ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/10' : 'text-slate-500'}`}
                      onClick={() => setTip(t_val.value)}
                    >
                      {t_val.label}{t_val.value > 0 ? ` (₹${t_val.value})` : ""}
                    </Button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-[11px] px-4 py-3 rounded-xl leading-relaxed flex items-start gap-2 shadow-sm font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-[2px] transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10" disabled={loading || uploading}>
                {loading || uploading ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <IndianRupee className="h-5 w-5 mr-3" />}
                {uploading ? t("donation_uploading_proof") : t("submit_payment")}
              </Button>

              <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed px-4">
                {t("donation_secure_note")}
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
