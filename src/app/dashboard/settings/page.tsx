"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Building2, Link as LinkIcon, Image as ImageIcon, Video } from "lucide-react"
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
    address: "",
    upi_id: "",
    youtube_url: ""
  })

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
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    value={formData.logo_url} 
                    onChange={(e) => setFormData({...formData, logo_url: e.target.value})} 
                    placeholder="https://..."
                    className="pl-9"
                  />
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
