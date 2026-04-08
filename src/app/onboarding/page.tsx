"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Loader2, Upload, FileText } from "lucide-react"
import { toast } from "sonner"

export default function NGOOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState({
    name: "",
    pan_number: "",
    registration_number: "",
    upi_id: "",
    description: "",
  })

  // Mock fields for CSR & 80G intended for MVP Pitch, 
  // not yet in SQL schema but visually present for trust demonstration.
  const [trustExt, setTrustExt] = useState({
    csr1: "",
    has80G: "yes",
    docFile: null as File | null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Insert into Supabase Organizations table (is_verified defaults to false)
    const { data: orgData, error: orgError } = await supabase.from("organizations").insert({
      name: formData.name,
      pan_number: formData.pan_number,
      registration_number: formData.registration_number,
      upi_id: formData.upi_id,
      description: formData.description,
      is_verified: false 
    }).select().single()

    if (orgError) {
      toast.error("Registration failed.", { description: orgError.message })
      setLoading(false)
      return
    }

    // Connect this user profile to the newly created org
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user) {
       await supabase.from("profiles").update({ 
         organization_id: orgData.id, 
         role: 'ngo_admin' 
       }).eq("id", userData.user.id)
    }

    setLoading(false)
    setStep(3) // Success Step
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />
      
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">NGO Partner Onboarding</h1>
            <p className="text-slate-600">Join the trust-first fundraising network for Indian nonprofits.</p>
          </div>

          <Card className="border-slate-200 shadow-lg border-t-4 border-t-teal-500">
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <CardHeader>
                  <CardTitle className="text-xl">Step 1: Core Organization Details</CardTitle>
                  <CardDescription>We strictly onboard registered trusts and Section 8 companies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                     <Label>Legal Entity Name</Label>
                     <Input required placeholder="As per PAN card" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Organization PAN Number</Label>
                       <Input required placeholder="e.g. AAATT1234T" className="uppercase" value={formData.pan_number} onChange={e => setFormData({...formData, pan_number: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <Label>Trust / Society Registration ID</Label>
                       <Input required placeholder="Registration Number" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <Label>Brief Mission Statement</Label>
                     <textarea required className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500" placeholder="What does your NGO do?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500">Continue to Step 2</Button>
                </CardContent>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="text-xl">Step 2: Financial & Compliance</CardTitle>
                  <CardDescription>We ensure zero platform fees by routing directly to your official UPI.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                     <Label>Official Bank UPI ID</Label>
                     <Input required placeholder="ngo@sbi" value={formData.upi_id} onChange={e => setFormData({...formData, upi_id: e.target.value})} />
                     <p className="text-xs text-slate-500 mt-1">Must be linked to your official current account.</p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                     <h3 className="font-semibold text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-600"/> Foundation Readiness</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>80G Tax Exemption</Label>
                          <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={trustExt.has80G} onChange={e => setTrustExt({...trustExt, has80G: e.target.value})}>
                            <option value="yes">Active</option>
                            <option value="no">Not Applicable</option>
                            <option value="pending">Applied</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <Label>CSR-1 Log (Optional)</Label>
                          <Input placeholder="CSR Registration Number" value={trustExt.csr1} onChange={e => setTrustExt({...trustExt, csr1: e.target.value})} />
                       </div>
                     </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                     <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                     <p className="text-sm font-semibold text-slate-700">Upload Registration Certificate (PDF)</p>
                     <p className="text-xs text-slate-500 mt-1">Select file or drag and drop</p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                    <Button type="submit" className="flex-[2] bg-teal-600 hover:bg-teal-500" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                      Submit Application
                    </Button>
                  </div>
                </CardContent>
              </form>
            )}

            {step === 3 && (
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                 <div className="h-20 w-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="h-10 w-10" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h2>
                 <p className="text-slate-600 mb-8 max-w-sm">
                   Our compliance team will review your registration and PAN details. You will receive an email once your NGO is verified and can start publishing campaigns.
                 </p>
                 <Button onClick={() => router.push("/dashboard")} className="bg-slate-900 hover:bg-slate-800 text-white">
                   Go to Workspace
                 </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
