"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2, Send, Save, IndianRupee, Video, Upload, ImageIcon, CheckCircle2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { MediaManager, MediaItem } from "@/components/MediaManager"
import { useLang } from "@/components/LanguageSwitcher"

export default function CampaignWizard() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLang()
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [story, setStory] = useState("")
  const [heroImage, setHeroImage] = useState("")
  const [heroImageName, setHeroImageName] = useState("")
  const [uploadingHero, setUploadingHero] = useState(false)
  const [mediaGallery, setMediaGallery] = useState<MediaItem[]>([])
  const [actualNeed, setActualNeed] = useState<number | "">("")

  // Philanthroforge 2% SaaS buffer calculation
  const bufferAmount = actualNeed ? Math.round(Number(actualNeed) * 0.02) : 0
  const publicGoal = actualNeed ? Number(actualNeed) + bufferAmount : 0

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (title.length < 10) newErrors.title = t("campaign_val_title")
    if (story.length < 100) newErrors.story = t("campaign_val_story")
    if (!actualNeed || actualNeed < 1000) newErrors.actualNeed = t("campaign_val_goal_min")
    if (heroImage && !heroImage.startsWith("http")) newErrors.heroImage = t("campaign_val_image")
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error(t("campaign_val_auth"))
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()
    
    const orgId = profile?.organization_id

    if (!orgId) {
      toast.error(t("campaign_val_no_org"))
      setLoading(false)
      return
    }
    
    const { error } = await supabase.from("campaigns").insert({
      organization_id: orgId,
      title,
      story,
      hero_image_url: heroImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
      video_url: mediaGallery.find(m => m.type === 'video' || m.type === 'short' || m.type === 'reel')?.url || "",
      media_gallery: mediaGallery,
      actual_need: Number(actualNeed),
      platform_buffer: bufferAmount,
      public_goal: publicGoal,
      status: "published",
      raised_amount: 0
    })

    setLoading(false)
    if (!error) {
      router.push("/dashboard")
      router.refresh()
    } else {
      toast.error(`${t("campaign_error_publish")} ${error.message}`)
    }
  }

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error(t("campaign_val_image_file"))
      return
    }
    
    setUploadingHero(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `campaign-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `campaigns/${fileName}`

      const { data, error } = await supabase.storage.from("documents").upload(filePath, file)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(filePath)
      setHeroImage(publicUrl)
      setHeroImageName(file.name)
      toast.success(t("campaign_upload_success"))
    } catch (err: any) {
      toast.error(t("donation_val_failed"), { description: err.message })
    } finally {
      setUploadingHero(false)
    }
  }

  const handleRemoveHero = () => {
    setHeroImage("")
    setHeroImageName("")
    toast.info(t("remove_file"))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2 text-center md:text-left tracking-tight">{t("campaign_new_title")}</h1>
        <p className="text-gray-500 font-medium text-center md:text-left max-w-2xl">{t("mgmt_desc")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="md:col-span-2">
          <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50">
              <CardTitle className="text-lg font-bold text-gray-900">{t("campaign_form_basic")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePublish} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="title" className="font-bold text-gray-700">{t("campaign_form_title")}</Label>
                    <span className={`text-[10px] font-black ${title.length < 10 ? 'text-red-400' : 'text-gray-400 uppercase tracking-widest'}`}>
                      {title.length}/100
                    </span>
                  </div>
                  <Input 
                    id="title" 
                    placeholder="e.g., Support 8-year-old Aarav's Heart Surgery" 
                    value={title} 
                    maxLength={100}
                    onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => ({...prev, title: ''})) }} 
                    className={`h-11 rounded-xl focus:ring-teal-500 focus:border-teal-500 font-medium ${errors.title ? "border-red-400 bg-red-50/10 focus:ring-red-400" : "border-gray-200"}`}
                  />
                  {errors.title && <p className="text-[10px] text-red-500 font-black uppercase tracking-tight">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="story" className="font-bold text-gray-700">{t("campaign_form_desc")}</Label>
                    <span className={`text-[10px] font-black ${story.length < 100 ? 'text-red-400' : 'text-gray-400 uppercase tracking-widest'}`}>
                      {story.length} {t("characters")} (min 100)
                    </span>
                  </div>
                  <textarea 
                    id="story" 
                    className={`flex min-h-[180px] w-full rounded-xl border bg-white px-3 py-3 text-sm font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                      errors.story ? "border-red-400 bg-red-50/10" : "border-gray-200"
                    }`}
                    placeholder="Describe the beneficiary, the situation, and how the funds will be used..." 
                    value={story} 
                    onChange={e => { setStory(e.target.value); if (errors.story) setErrors(prev => ({...prev, story: ''})) }} 
                  />
                  {errors.story && <p className="text-[10px] text-red-500 font-black uppercase tracking-tight">{errors.story}</p>}
                </div>
                
                <div className="space-y-4">
                  <Label className="text-gray-700 font-bold">{t("campaign_form_hero")} <span className="text-red-500">*</span></Label>
                  <div className="relative group w-full h-48 md:h-64 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center bg-gray-50/50 overflow-hidden hover:border-teal-400 transition-all hover:bg-teal-50/10">
                    {heroImage ? (
                      <>
                        <img src={heroImage} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                           <Upload className="h-8 w-8 text-white" />
                           <span className="text-white font-black text-sm uppercase tracking-wider">{t("campaign_upload_replaced")}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        {uploadingHero ? <Loader2 className="h-10 w-10 animate-spin text-teal-600" /> : <ImageIcon className="h-10 w-10" />}
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-600">{t("campaign_upload_banner")}</p>
                          <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">{t("campaign_upload_hint")}</p>
                        </div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleHeroUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={uploadingHero}
                    />
                  </div>
                  
                  {heroImage && (
                    <div className="flex items-center gap-2 p-3 bg-teal-50/50 border border-teal-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span className="text-xs font-bold text-gray-700 truncate flex-grow">
                        {heroImageName || t("campaign_upload_ready")}
                      </span>
                      <div className="flex items-center gap-3">
                        <a href={heroImage} target="_blank" rel="noreferrer" className="text-xs text-teal-600 font-black uppercase tracking-tight hover:underline">View</a>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleRemoveHero}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {errors.heroImage && <p className="text-[10px] text-red-500 font-black uppercase tracking-tight">{errors.heroImage}</p>}
                </div>

                <div className="space-y-4">
                  <Label className="text-gray-700 font-bold">{t("onboarding_main_doc")} <span className="text-gray-400 font-medium text-[10px] ml-2 uppercase tracking-wider">(Videos, Shorts, Reels & Images)</span></Label>
                  <div className="rounded-2xl overflow-hidden">
                    <MediaManager media={mediaGallery} onChange={setMediaGallery} />
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl h-12 font-bold text-gray-600 border-gray-200 hover:bg-gray-50 bg-white" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" /> {t("campaign_status_draft")}
                  </Button>
                  <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl h-12 font-black uppercase tracking-widest shadow-lg shadow-teal-500/10 active:scale-[0.98] transition-all" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    {t("campaign_form_save")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Pricing/Buffer Calculator */}
        <div className="md:col-span-1">
          <div className="sticky top-10 space-y-6">
             <Card className="border-teal-100 shadow-xl shadow-teal-500/5 rounded-2xl overflow-hidden bg-white">
               <CardHeader className="bg-teal-50/30 border-b border-teal-50">
                 <CardTitle className="text-teal-900 text-base font-bold flex items-center gap-2">
                   <IndianRupee className="h-4 w-4" /> {t("campaign_form_goal")}
                 </CardTitle>
               </CardHeader>
               <CardContent className="pt-6 space-y-6">
                 <div className="space-y-2">
                   <Label htmlFor="actualNeed" className="text-gray-700 font-bold text-xs uppercase tracking-wider">{t("campaign_form_goal")}</Label>
                   <div className="relative">
                     <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
                     <Input 
                       id="actualNeed" 
                       type="number" 
                       className={`h-11 pl-8 text-lg font-black rounded-xl ${errors.actualNeed ? "border-red-400 bg-red-50/10 focus:ring-red-400" : "border-gray-200"}`}
                       placeholder="1,00,000" 
                       value={actualNeed} 
                       onChange={e => { setActualNeed(e.target.value ? Number(e.target.value) : ""); if (errors.actualNeed) setErrors(prev => ({...prev, actualNeed: ''})) }} 
                     />
                   </div>
                   {errors.actualNeed && <p className="text-[10px] text-red-500 font-black uppercase tracking-tight">{errors.actualNeed}</p>}
                   <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{t("campaign_goal_desc")}</p>
                 </div>

                 <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 space-y-4">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-tighter">
                      <span>{t("campaign_goal_beneficiary")}</span>
                      <span className="text-gray-900">₹{Number(actualNeed).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-tighter border-b border-gray-100 pb-3">
                      <span className="flex items-center gap-1">
                         {t("campaign_goal_platform")}
                      </span>
                      <span className="text-gray-900">₹{bufferAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                       <span className="font-black text-gray-400 text-[10px] uppercase tracking-widest underline decoration-teal-500 underline-offset-4 decoration-2">{t("campaign_goal_public")}</span>
                       <span className="text-2xl font-black text-teal-600">₹{publicGoal.toLocaleString('en-IN')}</span>
                    </div>
                 </div>

                 <div className="text-[10px] text-gray-500 bg-white border border-gray-100 p-4 rounded-xl leading-relaxed font-medium">
                   <strong className="text-gray-900 font-bold uppercase tracking-widest block mb-1">{t("campaign_billing_title")}</strong> {t("campaign_billing_desc")}
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
