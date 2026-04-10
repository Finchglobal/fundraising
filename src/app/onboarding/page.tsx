"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Loader2, Upload, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function NGOOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: "",
    pan_number: "",
    registration_number: "",
    upi_id: "",
    description: "",
    registration_12a: "",
    registration_80g: "",
    csr_1_registration: "",
  })

  // State for success feedback
  const [isSuccess, setIsSuccess] = useState(false)

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name || formData.name.length < 3) newErrors.name = "Entity name must be at least 3 characters."
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan_number.toUpperCase())) newErrors.pan_number = "Invalid PAN format (e.g., AAATT1234T)."
    if (!formData.registration_number) newErrors.registration_number = "Registration ID is required."
    if (!formData.description || formData.description.length < 50) newErrors.description = "Please provide a more detailed mission statement (min 50 chars)."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.upi_id || !formData.upi_id.includes("@")) newErrors.upi_id = "Invalid UPI ID. Must contain @ (e.g., ngo@bank)."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep1()) {
      setStep(2)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    setLoading(true)

    try {
      // Insert into Supabase Organizations table
      const { data: orgData, error: orgError } = await supabase.from("organizations").insert({
        name: formData.name,
        pan_number: formData.pan_number.toUpperCase(),
        registration_number: formData.registration_number,
        upi_id: formData.upi_id,
        description: formData.description,
        registration_12a: formData.registration_12a || null,
        registration_80g: formData.registration_80g || null,
        csr_1_registration: formData.csr_1_registration || null,
        is_verified: false 
      }).select().single()

      if (orgError) {
        toast.error("Registration failed.", { description: orgError.message })
        setLoading(false)
        return
      }

      // Connect this user profile to the newly created org
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("profiles").update({ 
          organization_id: orgData.id, 
          role: 'ngo_admin' 
        }).eq("id", user.id)
        
        toast.success("Organization registered successfully!")
      }

      setLoading(false)
      setStep(3)
      window.scrollTo(0, 0)
    } catch (err: any) {
      toast.error("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />
      
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8 flex justify-between items-center px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === s ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 
                  step > s ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-12 sm:w-20 rounded ${step > s ? 'bg-teal-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          <Card className="border-slate-200 shadow-xl overflow-hidden rounded-2xl">
            {step === 1 && (
              <form onSubmit={handleNextStep} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900">Step 1: Core Organization Details</CardTitle>
                  <CardDescription>We strictly onboard registered trusts, societies and Section 8 companies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                     <Label className="text-slate-700 font-semibold">Legal Entity Name <span className="text-red-500">*</span></Label>
                     <Input 
                       placeholder="As per PAN card" 
                       value={formData.name} 
                       onChange={e => { setFormData({...formData, name: e.target.value}); if(errors.name) setErrors(prev => ({...prev, name: ''})) }} 
                       className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
                     />
                     {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-slate-700 font-semibold">Organization PAN <span className="text-red-500">*</span></Label>
                       <Input 
                         placeholder="e.g. AAATT1234T" 
                         className={`uppercase ${errors.pan_number ? "border-red-400 focus-visible:ring-red-400" : ""}`} 
                         maxLength={10}
                         value={formData.pan_number} 
                         onChange={e => { setFormData({...formData, pan_number: e.target.value}); if(errors.pan_number) setErrors(prev => ({...prev, pan_number: ''})) }} 
                       />
                       {errors.pan_number && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.pan_number}</p>}
                    </div>
                    <div className="space-y-2">
                       <Label className="text-slate-700 font-semibold">Registration ID <span className="text-red-500">*</span></Label>
                       <Input 
                         placeholder="Trust/Society Reg No." 
                         value={formData.registration_number} 
                         onChange={e => { setFormData({...formData, registration_number: e.target.value}); if(errors.registration_number) setErrors(prev => ({...prev, registration_number: ''})) }} 
                         className={errors.registration_number ? "border-red-400 focus-visible:ring-red-400" : ""}
                       />
                       {errors.registration_number && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.registration_number}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between items-center">
                       <Label className="text-slate-700 font-semibold">Mission Statement <span className="text-red-500">*</span></Label>
                       <span className={`text-[10px] font-bold ${formData.description.length < 50 ? 'text-red-400' : 'text-slate-400 uppercase tracking-wider'}`}>
                         {formData.description.length}/50 min
                       </span>
                     </div>
                     <textarea 
                       className={`flex min-h-[100px] w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                         errors.description ? "border-red-400" : "border-slate-200"
                       }`} 
                       placeholder="What is your organization's primary objective?" 
                       value={formData.description} 
                       onChange={e => { setFormData({...formData, description: e.target.value}); if(errors.description) setErrors(prev => ({...prev, description: ''})) }} 
                     />
                     {errors.description && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.description}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 rounded-xl h-11 shadow-lg shadow-teal-500/10">Continue to Step 2</Button>
                </CardContent>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-2 duration-300">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900">Step 2: Financial & Compliance</CardTitle>
                  <CardDescription>Zero platform fees by routing donations directly to your bank account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                     <Label className="text-slate-700 font-semibold">Official UPI ID <span className="text-red-500">*</span></Label>
                     <Input 
                       placeholder="ngo@bank" 
                       value={formData.upi_id} 
                       onChange={e => { setFormData({...formData, upi_id: e.target.value}); if(errors.upi_id) setErrors(prev => ({...prev, upi_id: ''})) }} 
                       className={errors.upi_id ? "border-red-400 focus-visible:ring-red-400" : ""}
                     />
                     <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter font-semibold">Must be linked to your trust's official bank account.</p>
                     {errors.upi_id && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.upi_id}</p>}
                  </div>
                  
                  <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-4 shadow-inner">
                     <h3 className="font-bold text-sm text-teal-900 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-600"/> Tax Compliance (Optional but Recommended)</h3>
                     
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-slate-700 font-semibold">80G Certificate No.</Label>
                           <Input placeholder="e.g. IT/80G/12345" value={formData.registration_80g} onChange={e => setFormData({...formData, registration_80g: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-slate-700 font-semibold">CSR-1 Registration</Label>
                           <Input placeholder="CSR000123456" value={formData.csr_1_registration} onChange={e => setFormData({...formData, csr_1_registration: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-slate-700 font-semibold">12A Certificate No.</Label>
                         <Input placeholder="e.g. IT/12A/12345" value={formData.registration_12a} onChange={e => setFormData({...formData, registration_12a: e.target.value})} />
                      </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-all group cursor-pointer">
                     <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                        <Upload className="h-5 w-5 text-slate-400 group-hover:text-teal-500" />
                     </div>
                     <p className="text-sm font-bold text-slate-700">Registration Certificate (PDF)</p>
                     <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Select file or drag and drop</p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                    <Button type="submit" className="flex-[2] bg-teal-600 hover:bg-teal-500 rounded-xl h-11 shadow-lg shadow-teal-500/10 transition-all active:scale-[0.98]" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                      Register Organization
                    </Button>
                  </div>
                </CardContent>
              </form>
            )}

            {step === 3 && (
              <CardContent className="py-20 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                 <div className="h-20 w-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-teal-500/10">
                    <CheckCircle2 className="h-10 w-10" />
                 </div>
                 <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Application Submitted!</h2>
                 <p className="text-slate-600 mb-10 max-w-sm leading-relaxed">
                   Our compliance team will review your registration details and PAN. You will receive an email once your NGO is verified and can start publishing campaigns.
                 </p>
                 <Button onClick={() => router.push("/dashboard")} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 px-8 font-bold shadow-lg">
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
