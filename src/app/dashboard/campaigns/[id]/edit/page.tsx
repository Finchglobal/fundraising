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

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  
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
         <p className="text-slate-500 font-medium">Fetching campaign details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
           <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Edit Fundraiser</h1>
          <p className="text-slate-600">Update your campaign story, goal, or manage your impact media gallery.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Main Content Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle>Core Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="title">Campaign Title</Label>
                    <span className={`text-[10px] font-bold ${title.length < 10 ? 'text-red-400' : 'text-slate-400 uppercase tracking-wider'}`}>
                      {title.length}/100
                    </span>
                  </div>
                  <Input 
                    id="title" 
                    value={title} 
                    maxLength={100}
                    onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => ({...prev, title: ''})) }} 
                    className={errors.title ? "border-red-400" : ""}
                  />
                  {errors.title && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="story">The Story</Label>
                    <span className={`text-[10px] font-bold ${story.length < 100 ? 'text-red-400' : 'text-slate-400 uppercase tracking-wider'}`}>
                      {story.length} chars
                    </span>
                  </div>
                  <textarea 
                    id="story" 
                    className={`flex min-h-[200px] w-full rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                      errors.story ? "border-red-400" : "border-slate-200"
                    }`}
                    value={story} 
                    onChange={e => { setStory(e.target.value); if (errors.story) setErrors(prev => ({...prev, story: ''})) }} 
                  />
                  {errors.story && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.story}</p>}
                </div>
            </CardContent>
          </Card>

          {/* Media Gallery Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
               <CardTitle className="text-indigo-900 flex items-center gap-2">
                 <Video className="h-5 w-5" /> Media Gallery
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <p className="text-sm text-slate-500 mb-6">
                 Add YouTube videos, Instagram Reels, or images. These will be categorized and displayed as horizontal galleries on your public page.
               </p>
               <MediaManager media={mediaGallery} onChange={setMediaGallery} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Hero & Goal */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="py-4">
              <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="relative group aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  {heroImage ? (
                    <img src={heroImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                       <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <input 
                    type="file" accept="image/*" 
                    onChange={handleHeroUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                     <div className="text-white font-bold text-xs flex flex-col items-center gap-2">
                        {uploadingHero ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                        <span>Change Cover</span>
                     </div>
                  </div>
               </div>
               <p className="text-[10px] text-slate-400 text-center">Recommended: 1600x900px</p>
            </CardContent>
          </Card>

          <Card className="border-teal-100 shadow-md">
            <CardHeader className="bg-teal-50/50 py-4">
               <CardTitle className="text-teal-900 text-sm flex items-center gap-2">
                 <IndianRupee className="h-4 w-4" /> Goal Management
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="space-y-1">
                 <Label className="text-xs text-slate-500">Beneficiary Need (₹)</Label>
                 <Input 
                   type="number"
                   value={actualNeed}
                   onChange={e => { setActualNeed(e.target.value ? Number(e.target.value) : ""); if (errors.actualNeed) setErrors(prev => ({...prev, actualNeed: ''})) }}
                   className="font-bold text-lg"
                 />
               </div>
               
               <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Platform Fee (2%)</span>
                    <span className="font-bold">₹{bufferAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-900">
                    <span className="font-bold">Public Goal</span>
                    <span className="font-extrabold text-teal-600 text-base">₹{publicGoal.toLocaleString()}</span>
                  </div>
               </div>
               
               <Button 
                 onClick={handleSave}
                 className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold h-12 shadow-lg shadow-teal-500/10"
                 disabled={saving}
               >
                 {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                 Save All Changes
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
