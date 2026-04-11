"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, UserCircle, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

export default function DonorSettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [UserId, setUserId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    avatar_url: ""
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || ""
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!UserId) return

    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        bio: formData.bio,
        avatar_url: formData.avatar_url
      })
      .eq("id", UserId)

    if (error) {
      toast.error("Failed to update profile", { description: error.message })
    } else {
      toast.success("Profile updated successfully!")
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600">Update your personal details, avatar, and bio.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5 text-teal-600" /> Personal Identity</CardTitle>
            <CardDescription>This information may be shown publicly on leaderboards if you choose not to donate anonymously.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 mb-6">
               <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                 {formData.avatar_url ? (
                   <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <UserCircle className="h-12 w-12 text-slate-300" />
                 )}
               </div>
               <div className="flex-1 space-y-2">
                 <Label>Profile Picture URL</Label>
                 <div className="relative">
                   <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                   <Input 
                     value={formData.avatar_url} 
                     onChange={(e) => setFormData({...formData, avatar_url: e.target.value})} 
                     placeholder="https://..."
                     className="pl-9"
                   />
                 </div>
               </div>
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Short Bio</Label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="I support environmental causes and education..."
              />
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
