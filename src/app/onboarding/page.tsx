"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Loader2, Upload, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useLang, type Lang } from "@/components/LanguageSwitcher"

export default function NGOOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { lang, setLang, t } = useLang()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [step, setStep] = useState(0)   // step 0 = language welcome
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
    registration_certificate_url: "",
    registration_certificate_name: "",
    registration_12a_url: "",
    registration_12a_name: "",
    registration_80g_url: "",
    registration_80g_name: "",
    csr_1_url: "",
    csr_1_name: "",
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast.error(t("onboarding_val_auth"))
        router.push("/login")
      } else {
        // Prevent existing NGO admins from onboarding again
        supabase.from("profiles").select("organization_id").eq("id", user.id).single().then(({ data }) => {
          if (data?.organization_id) {
            toast.info("You already have an organization.")
            router.push("/dashboard")
          } else {
            setCheckingAuth(false)
          }
        })
      }
    })
  }, [router, supabase.auth, t])

  // State for success feedback
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name || formData.name.length < 3) newErrors.name = t("onboarding_val_entity_name")
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan_number.toUpperCase())) newErrors.pan_number = t("onboarding_val_pan_format")
    if (!formData.registration_number) newErrors.registration_number = t("onboarding_val_reg_id")
    if (!formData.description || formData.description.length < 50) newErrors.description = t("onboarding_val_mission")
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.upi_id || !formData.upi_id.includes("@")) newErrors.upi_id = t("onboarding_val_upi")
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
        registration_certificate_url: formData.registration_certificate_url || null,
        is_verified: false 
      }).select().single()

      if (orgError) {
        toast.error(t("onboarding_val_failed"), { description: orgError.message })
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
        
        toast.success(t("onboarding_success_reg"))
      }

      setLoading(false)
      setStep(3)
      window.scrollTo(0, 0)
    } catch (err: any) {
      toast.error(t("error_unexpected"))
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldPrefix: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast.error(t("onboarding_val_pdf"))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("onboarding_val_file_size"))
      return
    }

    setUploadingDoc(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `certificates/${fileName}`

      const { data, error } = await supabase.storage.from("documents").upload(filePath, file)

      if (error) {
        throw error
      }

      const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(filePath)
      setFormData({ 
        ...formData, 
        [`${fieldPrefix}_url`]: publicUrl,
        [`${fieldPrefix}_name`]: file.name
      })
      toast.success(`${file.name} uploaded successfully`)
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message })
    } finally {
      setUploadingDoc(false)
    }
  }

  const handleRemoveFile = (fieldPrefix: string) => {
    setFormData({
      ...formData,
      [`${fieldPrefix}_url`]: "",
      [`${fieldPrefix}_name`]: ""
    })
    toast.info(t("remove_file"))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />
      
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator — only show steps 1–3 */}
          {step > 0 && (
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
          )}

          <Card className="border-slate-200 shadow-xl overflow-hidden rounded-2xl">
            {/* ── Step 0: Language Welcome ─────────────────── */}
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardHeader className="bg-gradient-to-br from-teal-50 to-blue-50 border-b border-teal-100 text-center pb-8">
                  <div className="text-4xl mb-3">🙏</div>
                  <CardTitle className="text-2xl font-extrabold text-slate-900">{t("onboarding_title")}</CardTitle>
                  <CardDescription className="text-base text-slate-600 mt-2">
                    {t("onboarding_desc")}<br />
                    <span className="text-sm text-slate-500">{t("onboarding_choose_lang")}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-10 space-y-6">
                  <div>
                    <p className="text-sm font-bold text-slate-700 text-center mb-4">Choose your preferred language / भाषा चुनें</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "en" as Lang, emoji: "🇬🇧", title: "English", sub: "International" },
                        { value: "hinglish" as Lang, emoji: "🤝", title: "Hinglish", sub: "Aasaan Hindi-English" },
                        { value: "hi" as Lang, emoji: "🇮🇳", title: "हिंदी", sub: "पूर्ण हिंदी" },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setLang(opt.value)}
                          className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center ${
                            lang === opt.value
                              ? "border-teal-500 bg-teal-50 shadow-md shadow-teal-100"
                              : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-3xl">{opt.emoji}</span>
                          <span className="font-bold text-slate-800 text-sm">{opt.title}</span>
                          <span className="text-[10px] text-slate-500">{opt.sub}</span>
                          {lang === opt.value && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => { setStep(1); window.scrollTo(0, 0) }}
                    className="w-full bg-teal-600 hover:bg-teal-500 rounded-xl h-12 text-base font-bold shadow-lg shadow-teal-500/10"
                  >
                    {t("get_started")} →
                  </Button>
                  <p className="text-center text-xs text-slate-400">You can change the language anytime from the navigation bar.</p>
                </CardContent>
              </div>
            )}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900">{t("onboarding_step1_title")}</CardTitle>
                  <CardDescription>{t("onboarding_step1_desc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                     <Label className="text-slate-700 font-semibold">{t("onboarding_legal_name")} <span className="text-red-500">*</span></Label>
                     <Input 
                       placeholder={t("onboarding_legal_name_placeholder")} 
                       value={formData.name} 
                       onChange={e => { setFormData({...formData, name: e.target.value}); if(errors.name) setErrors(prev => ({...prev, name: ''})) }} 
                       className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
                     />
                     {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-slate-700 font-semibold">{t("onboarding_pan")} <span className="text-red-500">*</span></Label>
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
                       <Label className="text-slate-700 font-semibold">{t("onboarding_reg_id")} <span className="text-red-500">*</span></Label>
                       <Input 
                         placeholder={t("onboarding_reg_id_placeholder")} 
                         value={formData.registration_number} 
                         onChange={e => { setFormData({...formData, registration_number: e.target.value}); if(errors.registration_number) setErrors(prev => ({...prev, registration_number: ''})) }} 
                         className={errors.registration_number ? "border-red-400 focus-visible:ring-red-400" : ""}
                       />
                       {errors.registration_number && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.registration_number}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between items-center">
                       <Label className="text-slate-700 font-semibold">{t("onboarding_mission")} <span className="text-red-500">*</span></Label>
                       <span className={`text-[10px] font-bold ${formData.description.length < 50 ? 'text-red-400' : 'text-slate-400 uppercase tracking-wider'}`}>
                         {formData.description.length}/50 min
                       </span>
                     </div>
                     <textarea 
                       className={`flex min-h-[100px] w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                         errors.description ? "border-red-400" : "border-slate-200"
                       }`} 
                       placeholder={t("onboarding_mission_placeholder")} 
                       value={formData.description} 
                       onChange={e => { setFormData({...formData, description: e.target.value}); if(errors.description) setErrors(prev => ({...prev, description: ''})) }} 
                     />
                     {errors.description && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.description}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 rounded-xl h-11 shadow-lg shadow-teal-500/10">{t("view_all")} → {t("onboarding_step2_title")}</Button>
                </CardContent>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-2 duration-300">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold text-slate-900">{t("onboarding_step2_title")}</CardTitle>
                  <CardDescription>{t("onboarding_step2_desc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                     <Label className="text-slate-700 font-semibold">{t("onboarding_upi_id")} <span className="text-red-500">*</span></Label>
                     <Input 
                       placeholder="ngo@bank" 
                       value={formData.upi_id} 
                       onChange={e => { setFormData({...formData, upi_id: e.target.value}); if(errors.upi_id) setErrors(prev => ({...prev, upi_id: ''})) }} 
                       className={errors.upi_id ? "border-red-400 focus-visible:ring-red-400" : ""}
                     />
                     <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter font-semibold">Must be linked to your trust's official bank account.</p>
                     {errors.upi_id && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.upi_id}</p>}
                  </div>
                  
                  <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-6 shadow-inner">
                     <h3 className="font-bold text-sm text-teal-900 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-600"/> {t("onboarding_tax_compliance")}</h3>
                     
                      <div className="grid grid-cols-1 gap-6">
                        {/* 80G Section */}
                         <div className="space-y-3">
                            <div className="flex justify-between items-end gap-4">
                              <div className="flex-grow space-y-2">
                                <Label className="text-slate-700 font-semibold">{t("onboarding_80g_label")}</Label>
                                <Input placeholder="e.g. IT/80G/12345" value={formData.registration_80g} onChange={e => setFormData({...formData, registration_80g: e.target.value})} />
                             </div>
                             <div className="relative overflow-hidden w-32 h-10 flex-shrink-0">
                               <Input 
                                 type="file" 
                                 accept=".pdf" 
                                 onChange={(e) => handleFileUpload(e, "registration_80g")}
                                 className="absolute inset-0 opacity-0 cursor-pointer z-10"
                               />
                               <Button type="button" variant="outline" className={`w-full h-full text-xs gap-1 transition-all group-hover:border-teal-400 ${formData.registration_80g_url ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600'}`}>
                                 {formData.registration_80g_url ? (
                                   <>
                                     <CheckCircle2 className="h-3 w-3" />
                                     <span className="group-hover:hidden">Uploaded</span>
                                     <span className="hidden group-hover:inline">Replace?</span>
                                   </>
                                 ) : (
                                   <>
                                     <Upload className="h-3 w-3" />
                                     <span>Add PDF</span>
                                   </>
                                 )}
                               </Button>
                             </div>
                           </div>
                           {formData.registration_80g_name && (
                             <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-teal-100 rounded-lg animate-in slide-in-from-left-1">
                               <FileText className="h-3 w-3 text-teal-600" />
                               <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{formData.registration_80g_name}</span>
                               <div className="ml-auto flex items-center gap-3">
                                 <a href={formData.registration_80g_url} target="_blank" rel="noreferrer" className="text-[10px] text-teal-600 font-bold hover:underline">View</a>
                                 <button type="button" onClick={() => handleRemoveFile("registration_80g")} className="text-[10px] text-red-500 font-bold hover:text-red-700 uppercase tracking-tighter">Remove</button>
                               </div>
                             </div>
                           )}
                        </div>

                        {/* 12A Section */}
                         <div className="space-y-3">
                            <div className="flex justify-between items-end gap-4">
                              <div className="flex-grow space-y-2">
                                <Label className="text-slate-700 font-semibold">{t("onboarding_12a_label")}</Label>
                                <Input placeholder="e.g. IT/12A/12345" value={formData.registration_12a} onChange={e => setFormData({...formData, registration_12a: e.target.value})} />
                             </div>
                             <div className="relative group overflow-hidden w-32 h-10 flex-shrink-0">
                               <Input 
                                 type="file" 
                                 accept=".pdf" 
                                 onChange={(e) => handleFileUpload(e, "registration_12a")}
                                 className="absolute inset-0 opacity-0 cursor-pointer z-10"
                               />
                               <Button type="button" variant="outline" className={`w-full h-full text-xs gap-1 transition-all group-hover:border-teal-400 ${formData.registration_12a_url ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600'}`}>
                                 {formData.registration_12a_url ? (
                                   <>
                                     <CheckCircle2 className="h-3 w-3" />
                                     <span className="group-hover:hidden">Uploaded</span>
                                     <span className="hidden group-hover:inline">Replace?</span>
                                   </>
                                 ) : (
                                   <>
                                     <Upload className="h-3 w-3" />
                                     <span>Add PDF</span>
                                   </>
                                 )}
                               </Button>
                             </div>
                           </div>
                           {formData.registration_12a_name && (
                             <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-teal-100 rounded-lg animate-in slide-in-from-left-1">
                               <FileText className="h-3 w-3 text-teal-600" />
                               <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{formData.registration_12a_name}</span>
                               <div className="ml-auto flex items-center gap-3">
                                 <a href={formData.registration_12a_url} target="_blank" rel="noreferrer" className="text-[10px] text-teal-600 font-bold hover:underline">View</a>
                                 <button type="button" onClick={() => handleRemoveFile("registration_12a")} className="text-[10px] text-red-500 font-bold hover:text-red-700 uppercase tracking-tighter">Remove</button>
                               </div>
                             </div>
                           )}
                        </div>

                        {/* CSR-1 Section */}
                         <div className="space-y-3">
                            <div className="flex justify-between items-end gap-4">
                              <div className="flex-grow space-y-2">
                                <Label className="text-slate-700 font-semibold">{t("onboarding_csr1_label")}</Label>
                                <Input placeholder="CSR000123456" value={formData.csr_1_registration} onChange={e => setFormData({...formData, csr_1_registration: e.target.value})} />
                             </div>
                             <div className="relative group overflow-hidden w-32 h-10 flex-shrink-0">
                               <Input 
                                 type="file" 
                                 accept=".pdf" 
                                 onChange={(e) => handleFileUpload(e, "csr_1")}
                                 className="absolute inset-0 opacity-0 cursor-pointer z-10"
                               />
                               <Button type="button" variant="outline" className={`w-full h-full text-xs gap-1 transition-all group-hover:border-teal-400 ${formData.csr_1_url ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600'}`}>
                                 {formData.csr_1_url ? (
                                   <>
                                     <CheckCircle2 className="h-3 w-3" />
                                     <span className="group-hover:hidden">Uploaded</span>
                                     <span className="hidden group-hover:inline">Replace?</span>
                                   </>
                                 ) : (
                                   <>
                                     <Upload className="h-3 w-3" />
                                     <span>Add PDF</span>
                                   </>
                                 )}
                               </Button>
                             </div>
                           </div>
                           {formData.csr_1_name && (
                             <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-teal-100 rounded-lg animate-in slide-in-from-left-1">
                               <FileText className="h-3 w-3 text-teal-600" />
                               <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{formData.csr_1_name}</span>
                               <div className="ml-auto flex items-center gap-3">
                                 <a href={formData.csr_1_url} target="_blank" rel="noreferrer" className="text-[10px] text-teal-600 font-bold hover:underline">View</a>
                                 <button type="button" onClick={() => handleRemoveFile("csr_1")} className="text-[10px] text-red-500 font-bold hover:text-red-700 uppercase tracking-tighter">Remove</button>
                               </div>
                             </div>
                           )}
                        </div>
                      </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">{t("onboarding_main_doc")} <span className="text-red-500">*</span></Label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-all group cursor-pointer overflow-hidden">
                       <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={(e) => handleFileUpload(e, "registration_certificate")}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                          disabled={uploadingDoc}
                       />
                       <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                          {uploadingDoc ? <Loader2 className="h-5 w-5 text-teal-600 animate-spin" /> : <Upload className="h-5 w-5 text-slate-400 group-hover:text-teal-500" />}
                       </div>
                       <p className="text-sm font-bold text-slate-700">
                          {formData.registration_certificate_url ? (
                            <span className="group-hover:hidden">{t("verified")}!</span>
                          ) : t("onboarding_upload_pdf")}
                          {formData.registration_certificate_url && (
                             <span className="hidden group-hover:inline text-teal-600">Click to Change File</span>
                          )}
                       </p>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                          {formData.registration_certificate_name ? `Current: ${formData.registration_certificate_name}` : "Select file or drag and drop"}
                       </p>
                       {formData.registration_certificate_url && (
                         <div className="mt-3 relative z-30 flex items-center justify-center gap-4">
                           <a href={formData.registration_certificate_url} target="_blank" rel="noreferrer" className="text-xs text-teal-600 font-bold hover:underline">
                             Preview Certificate
                           </a>
                           <button type="button" onClick={() => handleRemoveFile("registration_certificate")} className="text-xs text-red-500 font-bold hover:text-red-700">
                             Remove File
                           </button>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setStep(1)} disabled={loading}>{t("back")}</Button>
                    <Button type="submit" className="flex-[2] bg-teal-600 hover:bg-teal-500 rounded-xl h-11 shadow-lg shadow-teal-500/10 transition-all active:scale-[0.98]" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                      {t("onboarding_apply_ngo")}
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
                 <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{t("onboarding_success_title")}</h2>
                 <p className="text-slate-600 mb-10 max-w-sm leading-relaxed">
                   {t("onboarding_success_desc")}
                 </p>
                 <Button onClick={() => router.push("/dashboard")} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 px-8 font-bold shadow-lg">
                   {t("onboarding_go_workspace")}
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
