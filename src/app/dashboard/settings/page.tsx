"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Building2, Link as LinkIcon, Image as ImageIcon, Video, Upload, CheckCircle2, Trash2, FileText } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    logo_name: "",
    address: "",
    upi_id: "",
    youtube_url: ""
  })
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    async function loadOrg() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, organizations(*)")
        .eq("id", user.id)
        .single()

      if (profile?.organization_id && profile.organizations) {
        setOrgId(profile.organization_id)
        const org: any = profile.organizations
        setFormData({
          name: org.name || "",
          description: org.description || "",
          logo_url: org.logo_url || "",
          logo_name: org.logo_url ? "Current Logo" : "",
          address: org.address || "",
          upi_id: org.upi_id || "",
          youtube_url: org.youtube_url || ""
        })
      }
      setLoading(false)
    }
    loadOrg()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return

    setSaving(true)
    const { error } = await supabase
      .from("organizations")
      .update({
        name: formData.name,
        description: formData.description,
        logo_url: formData.logo_url,
        address: formData.address,
        upi_id: formData.upi_id,
        youtube_url: formData.youtube_url
      })
      .eq("id", orgId)

    if (error) {
      toast.error("Failed to update profile", { description: error.message })
    } else {
      toast.success("Organization profile updated successfully!")
    }
    setSaving(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.")
      return
    }
    
    setUploadingLogo(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${orgId}-logo-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { data, error } = await supabase.storage.from("documents").upload(filePath, file)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(filePath)
      setFormData({ ...formData, logo_url: publicUrl, logo_name: file.name })
      toast.success("Logo uploaded!")
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo_url: "", logo_name: "" })
    toast.info("Logo removed")
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!orgId) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">No organizations found linked to your account.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">NGO Profile</h1>
        <p className="text-slate-600">Update your public information, logo, and core details.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-teal-600" /> Public Details</CardTitle>
            <CardDescription>This information will appear on your campaign pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Bio / Mission Statement</Label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-slate-700 font-semibold">Organization Logo</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative group w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden hover:border-teal-400 transition-all">
                    {formData.logo_url ? (
                      <>
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Upload className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        {uploadingLogo ? <Loader2 className="h-6 w-6 animate-spin text-teal-600" /> : <ImageIcon className="h-6 w-6" />}
                        <span className="text-[10px] font-bold uppercase">Upload</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={uploadingLogo}
                    />
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    {formData.logo_url ? (
                      <div className="space-y-2 animate-in slide-in-from-left-2">
                        <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-100 rounded-xl">
                          <CheckCircle2 className="h-4 w-4 text-teal-600" />
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                            {formData.logo_name || "Logo uploaded"}
                          </span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleRemoveLogo}
                            className="ml-auto h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Click the image to replace</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 max-w-xs italic">
                        Upload your high-resolution brand logo (PNG/JPG). This will appear on all campaign pages.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Official UPI ID</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    value={formData.upi_id} 
                    onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Registered Address</Label>
              <Input 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                placeholder="HQ Address"
              />
            </div>

            <div className="space-y-2">
              <Label>Featured YouTube Video / Reel URL</Label>
              <div className="relative">
                <Video className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                <Input 
                  value={formData.youtube_url} 
                  onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} 
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-slate-500">This will be embedded prominently on your public NGO profile page.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white min-w-[120px]" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
