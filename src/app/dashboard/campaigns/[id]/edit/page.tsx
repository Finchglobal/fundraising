"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2, Send, Save, IndianRupee, Video, Upload, ImageIcon, CheckCircle2, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { MediaManager, MediaItem } from "@/components/MediaManager"
import Link from "next/link"
import { useLang } from "@/components/LanguageSwitcher"

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const { t } = useLang()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form State
  const [title, setTitle] = useState("")
  const [story, setStory] = useState("")
  const [heroImage, setHeroImage] = useState("")
  const [heroImageName, setHeroImageName] = useState("")
  const [uploadingHero, setUploadingHero] = useState(false)
  const [actualNeed, setActualNeed] = useState<number | "">("")
  const [mediaGallery, setMediaGallery] = useState<MediaItem[]>([])

  // 2% buffer logic
  const bufferAmount = actualNeed ? Math.round(Number(actualNeed) * 0.02) : 0
  const publicGoal = actualNeed ? Number(actualNeed) + bufferAmount : 0

  useEffect(() => {
    async function loadCampaign() {
      const { data: campaign, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !campaign) {
        toast.error("Campaign not found")
        router.push("/dashboard")
        return
      }

      setTitle(campaign.title || "")
      setStory(campaign.story || "")
      setHeroImage(campaign.hero_image_url || "")
      setActualNeed(campaign.actual_need || "")
      
      // Load media gallery (handling legacy video_url too)
      let initialGallery = Array.isArray(campaign.media_gallery) ? campaign.media_gallery : []
      if (initialGallery.length === 0 && campaign.video_url) {
        initialGallery = [{ id: 'legacy-vid', type: 'video', url: campaign.video_url }]
      }
      setMediaGallery(initialGallery)
      
      setLoading(false)
    }
    loadCampaign()
  }, [id, router, supabase])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (title.length < 10) newErrors.title = "Title must be at least 10 characters."
    if (story.length < 100) newErrors.story = "Story must be at least 100 characters to build donor trust."
    if (!actualNeed || actualNeed < 1000) newErrors.actualNeed = "Minimum beneficiary need must be ₹1,000."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    setSaving(true)
    
    const { error } = await supabase.from("campaigns").update({
      title,
      story,
      hero_image_url: heroImage,
      actual_need: Number(actualNeed),
      platform_buffer: bufferAmount,
      public_goal: publicGoal,
      media_gallery: mediaGallery,
      // Update legacy field just in case
      video_url: mediaGallery.find(m => m.type === 'video' || m.type === 'short' || m.type === 'reel')?.url || ""
    }).eq("id", id)

    setSaving(false)
    if (!error) {
      toast.success("Campaign updated successfully!")
      router.push("/dashboard")
      router.refresh()
    } else {
      toast.error("Failed to update campaign", { description: error.message })
    }
  }

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.")
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
      toast.success("Cover image updated!")
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message })
    } finally {
      setUploadingHero(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" />
         <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Fetching campaign details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="h-10 w-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:border-gray-900 transition-all text-gray-400 hover:text-gray-900 shadow-sm">
           <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{t("campaign_edit_title")}</h1>
          <p className="text-gray-500 font-medium">{t("mgmt_desc")}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Main Content Card */}
          <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50">
              <CardTitle className="text-lg font-bold text-gray-900">{t("campaign_form_basic")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="title" className="font-bold text-gray-700">{t("campaign_form_title")}</Label>
                    <span className={`text-[10px] font-black ${title.length < 10 ? 'text-red-400' : 'text-gray-400 uppercase tracking-widest'}`}>
                      {title.length}/100
                    </span>
                  </div>
                  <Input 
                    id="title" 
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
                      {story.length} {t("characters")}
                    </span>
                  </div>
                  <textarea 
                    id="story" 
                    className={`flex min-h-[220px] w-full rounded-xl border bg-white px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-all ${
                      errors.story ? "border-red-400 bg-red-50/10" : "border-gray-200"
                    }`}
                    value={story} 
                    onChange={e => { setStory(e.target.value); if (errors.story) setErrors(prev => ({...prev, story: ''})) }} 
                  />
                  {errors.story && <p className="text-[10px] text-red-500 font-black uppercase tracking-tight">{errors.story}</p>}
                </div>
            </CardContent>
          </Card>

          {/* Media Gallery Card */}
          <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-teal-50/30 border-b border-teal-50">
               <CardTitle className="text-teal-950 text-lg font-bold flex items-center gap-2">
                 <Video className="h-5 w-5" /> {t("media_add_title")}
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <p className="text-xs font-medium text-gray-500 mb-6 leading-relaxed">
                 {t("media_empty_desc")} These items will be displayed as an interactive slider on your crowdfunding page.
               </p>
               <MediaManager media={mediaGallery} onChange={setMediaGallery} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Hero & Goal */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="py-4 bg-gray-50/50">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t("campaign_form_hero")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
               <div className="relative group aspect-video rounded-xl border-2 border-dashed border-gray-100 overflow-hidden bg-gray-50/50 hover:border-teal-400 transition-all">
                  {heroImage ? (
                    <img src={heroImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                       <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <input 
                    type="file" accept="image/*" 
                    onChange={handleHeroUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                     <div className="text-white font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-2">
                        {uploadingHero ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                        <span>Change Cover</span>
                     </div>
                  </div>
               </div>
               <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-tighter">Recommended: 1600x900px</p>
            </CardContent>
          </Card>

          <Card className="border-teal-100 shadow-xl shadow-teal-500/5 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-teal-50/30 py-4 border-b border-teal-50">
               <CardTitle className="text-teal-900 text-sm font-bold flex items-center gap-2">
                 <IndianRupee className="h-4 w-4" /> {t("campaign_form_goal")}
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Beneficiary Need (₹)</Label>
                 <Input 
                   type="number"
                   value={actualNeed}
                   onChange={e => { setActualNeed(e.target.value ? Number(e.target.value) : ""); if (errors.actualNeed) setErrors(prev => ({...prev, actualNeed: ''})) }}
                   className={`h-11 font-black text-lg rounded-xl border-gray-200 focus:ring-teal-500 ${errors.actualNeed ? "border-red-400 bg-red-50/10 focus:ring-red-400" : ""}`}
                 />
               </div>
               
               <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-[10px] font-bold text-gray-500 uppercase tracking-tight space-y-4">
                  <div className="flex justify-between">
                    <span>Platform Support (2%)</span>
                    <span className="text-gray-900">₹{bufferAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-3 items-center">
                    <span className="font-black text-gray-400 text-[9px] tracking-widest underline decoration-teal-500 underline-offset-4 decoration-2">Public Goal</span>
                    <span className="font-black text-teal-600 text-xl">₹{publicGoal.toLocaleString()}</span>
                  </div>
               </div>
               
               <Button 
                 onClick={handleSave}
                 className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-[2px] h-12 shadow-lg shadow-teal-500/10 active:scale-[0.98] transition-all"
                 disabled={saving}
               >
                 {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                 {t("campaign_form_save")}
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
