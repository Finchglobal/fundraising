"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function AmbassadorOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState("")
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    youtube: "",
    twitter: ""
  })
  
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("Please log in to become an Ambassador")
        router.push("/login?redirect=/ambassador/onboarding")
        return
      }

      // Check if already an ambassador
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_ambassador, ambassador_username")
        .eq("id", session.user.id)
        .single()

      if (profile?.is_ambassador) {
        toast.info("You are already an Impact Ambassador!")
        router.push("/ambassador/dashboard")
        return
      }

      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || username.length < 3) {
      toast.error("Please enter a valid username (min 3 characters)")
      return
    }
    // Simple username validation (lowercase alnum)
    if (!/^[a-z0-9_]+$/.test(username)) {
      toast.error("Username can only contain lowercase letters, numbers, and underscores")
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      // Clean social links (remove empty ones)
      const cleanLinks = Object.fromEntries(
        Object.entries(socialLinks).filter(([_, v]) => v.trim() !== "")
      )

      const { error } = await supabase
        .from("profiles")
        .update({
          is_ambassador: true,
          ambassador_username: username,
          social_links: cleanLinks
        })
        .eq("id", session.user.id)

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error("This username is already taken. Please choose another.")
        }
        throw error
      }

      setStep(2)
      toast.success("Welcome to the Ambassador Program!")
      
      // Delay to let user see success, then redirect
      setTimeout(() => {
        router.push("/ambassador/dashboard")
      }, 3000)

    } catch (err: any) {
      toast.error(err.message || "Failed to create profile")
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />
      
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-xl">
          <Card className="border-slate-200 shadow-xl overflow-hidden rounded-2xl">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100 text-center pb-8 pt-10">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Sparkles className="h-8 w-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-2xl font-extrabold text-slate-900">Become an Impact Ambassador</CardTitle>
                  <CardDescription className="text-base text-slate-600 mt-2 max-w-md mx-auto">
                    Turn your social reach into real-world impact. Earn badges, top the leaderboard, and track exactly how many lives you're changing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-10">
                  <form onSubmit={handleCreateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="font-bold">Choose your unique username</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 sm:text-sm font-medium">
                          philanthroforge.com/
                        </span>
                        <Input
                          id="username"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          className="rounded-l-none h-11"
                          placeholder="johndoe"
                        />
                      </div>
                      <p className="text-xs text-slate-500">This will be your tracking link (e.g. ?ref={username || 'johndoe'})</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <Label className="font-bold">Social Links (Optional)</Label>
                      <p className="text-xs text-slate-500 pb-2">Connect your profiles so your supporters can find you.</p>
                      
                      <div className="space-y-3">
                        <Input
                          placeholder="Instagram Handle (e.g. @username)"
                          value={socialLinks.instagram}
                          onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                          className="h-11"
                        />
                        <Input
                          placeholder="YouTube Channel URL"
                          value={socialLinks.youtube}
                          onChange={(e) => setSocialLinks({...socialLinks, youtube: e.target.value})}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 text-base font-bold shadow-lg shadow-indigo-500/20 mt-4"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Activate Ambassador Profile"}
                    </Button>
                  </form>
                </CardContent>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in zoom-in duration-500 text-center py-16 px-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3">You're Official!</h2>
                <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                  Your Impact Ambassador profile is live. We're taking you to your new dashboard where you can start generating tracking links.
                </p>
                <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
              </div>
            )}
          </Card>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
}
