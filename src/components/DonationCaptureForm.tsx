"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, IndianRupee } from "lucide-react"

export default function DonationCaptureForm({ campaignId, triggerClassName }: { campaignId: string, triggerClassName?: string }) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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

  // Pre-fill user data if logged in
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setEmail(user.email || "")
        
        // Fetch profile for name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()
        
        if (profile?.full_name) {
          setName(profile.full_name)
        }
      }
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !utr) return

    setLoading(true)

    const { error } = await supabase.from("donations").insert({
      campaign_id: campaignId,
      donor_id: userId,
      donor_name: name,
      donor_email: email || null,
      donor_phone: phone || null,
      donor_pan: pan || null,
      amount: amount,
      platform_tip: tip,
      upi_utr: utr,
      is_anonymous: anonymous,
      status: "pending"
    })

    setLoading(false)

    if (!error) {
       setSuccess(true)
       // Auto close after 3 seconds
       setTimeout(() => {
         setOpen(false)
         setSuccess(false)
         // Reset state
         setName("")
         setEmail("")
         setPhone("")
         setPan("")
         setAmount("")
         setUtr("")
         setTip(0)
       }, 3000)
    } else {
       alert("Error submitting details: " + error.message)
    }
  }

  // Pre-calculated tip options
  const baseAmount = Number(amount) || 0;
  const tips = [
     { label: "10%", value: Math.round(baseAmount * 0.10) },
     { label: "15%", value: Math.round(baseAmount * 0.15) },
     { label: "Custom", value: null },
     { label: "No Tip", value: 0 }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName || "w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-6 text-lg rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20"}>
          <CheckCircle2 className="mr-2 h-5 w-5" /> I Have Paid
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        {success ? (
           <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle2 className="h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl mb-2">Thank you!</DialogTitle>
              <DialogDescription className="text-base text-slate-600 px-4">
                 Your UTR ({utr}) has been securely submitted. The NGO will verify this transfer against their bank statement and an official receipt will be generated.
              </DialogDescription>
           </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm your Contribution</DialogTitle>
              <DialogDescription>
                Thank you for donating. We need the 12-digit UPI UTR number from your payment app to match the transfer and verify your receipt.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="amount">Amount Sent</Label>
                   <div className="relative">
                     <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                     <Input id="amount" type="number" min="1" className="pl-8" placeholder="1000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="utr">12-Digit UTR</Label>
                   <Input id="utr" placeholder="e.g. 312345678901" maxLength={20} value={utr} onChange={(e) => setUtr(e.target.value)} required />
                 </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Donor Full Name</Label>
                <Input id="name" placeholder="Name as per PAN (for tax receipt)" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="email">Email Address (Optional)</Label>
                   <Input id="email" type="email" placeholder="For receipt delivery" value={email} onChange={(e) => setEmail(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="phone">Phone / WhatsApp</Label>
                   <Input id="phone" type="tel" placeholder="+91..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                 </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan">PAN Number (For 80G Check)</Label>
                <Input id="pan" placeholder="Optional. Required for tax exemption." maxLength={10} value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} className="uppercase" />
              </div>

              <div className="pt-2">
                <Label className="block mb-2">Optional Platform Tip</Label>
                <p className="text-xs text-slate-500 mb-3 block">Since we don't charge the NGO any gateway fees for UPI, tips help us keep Philanthroforge completely free for verified causes.</p>
                <div className="flex gap-2">
                   {tips.map((t, idx) => (
                      <Button 
                        key={idx} 
                        type="button" 
                        variant={tip === t.value ? "default" : "outline"}
                        className={`flex-1 text-xs ${tip === t.value && t.value !== 0 ? 'bg-teal-600' : ''}`}
                        onClick={() => t.value !== null && setTip(t.value)}
                      >
                         {t.label} 
                         {t.value ? ` (₹${t.value})` : ""}
                      </Button>
                   ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-4">
                 <input type="checkbox" id="anon" className="rounded text-teal-600 focus:ring-teal-500" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                 <Label htmlFor="anon" className="text-sm text-slate-600 cursor-pointer">Keep my donation anonymous on the public page</Label>
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-4" disabled={loading}>
                 {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <IndianRupee className="h-4 w-4 mr-2" />}
                 Submit UTR Details
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
