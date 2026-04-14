"use client"

import { Share2, Sparkles, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface ShareButtonProps {
  campaignId: string
  campaignTitle: string
  className?: string
}

export function ShareButton({ campaignId, campaignTitle, className = "" }: ShareButtonProps) {
  const supabase = createClient()
  const [showPromo, setShowPromo] = useState(false)
  const [isAmbassador, setIsAmbassador] = useState(false)
  const [ambassadorUsername, setAmbassadorUsername] = useState<string | null>(null)
  const [isAuth, setIsAuth] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [username, setUsername] = useState("")
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/campaigns/${campaignId}` : `https://philanthroforge.com/campaigns/${campaignId}`
  const finalUrl = isAmbassador && ambassadorUsername
    ? `${baseUrl}?ref=${ambassadorUsername}`
    : baseUrl

  useEffect(() => {
    async function checkStatus() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsAuth(true)
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_ambassador, ambassador_username")
          .eq("id", session.user.id)
          .single()
        if (profile?.is_ambassador) {
          setIsAmbassador(true)
          setAmbassadorUsername(profile.ambassador_username)
        }
      }
    }
    checkStatus()
  }, [])

  const performShare = async (forceUntracked = false) => {
    let shareText = `I'm supporting "${campaignTitle}" on PhilanthroForge. Please help:`
    
    // AI Generated Captions for Tracked Ambassadors
    if (isAmbassador && !forceUntracked) {
      const aiCaptions = [
        `I'm giving trust-first on PhilanthroForge. Join me in backing "${campaignTitle}":`,
        `Impact requires action. I just backed this verified NGO campaign for "${campaignTitle}":`,
        `Transparency matters. Help me fund this urgent cause via PhilanthroForge - "${campaignTitle}":`,
        `Every rupee goes directly to the cause. I'm supporting "${campaignTitle}"—join my impact circle here:`,
        `Real impact, verified by experts. Let's make a difference together for "${campaignTitle}":`
      ]
      shareText = aiCaptions[Math.floor(Math.random() * aiCaptions.length)]
    }

    const shareUrl = (isAmbassador && !forceUntracked && ambassadorUsername) 
      ? `${baseUrl}?ref=${ambassadorUsername}` 
      : baseUrl

    if (navigator.share) {
      try {
        await navigator.share({ title: campaignTitle, text: shareText, url: shareUrl })
      } catch (e) { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAmbassador) {
      performShare()
    } else {
      setShowPromo(true) // Always prompt guests and regular users to upgrade
    }
  }

  const handleOneClickUpgrade = async () => {
    if (!username.trim() || username.length < 3) {
      toast.error("Please enter a valid username (min 3 chars)")
      return
    }
    setUpgrading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { error } = await supabase.from("profiles").update({
        is_ambassador: true,
        ambassador_username: username
      }).eq("id", session.user.id)
      if (error) {
        if (error.code === '23505') throw new Error("Username already taken!")
        throw error
      }
      setIsAmbassador(true)
      setAmbassadorUsername(username)
      setShowPromo(false)
      toast.success("🎉 You are now an Impact Ambassador! Sharing your tracked link...")
      setTimeout(() => performShare(), 500)
    } catch (e: any) {
      toast.error(e.message || "Failed to upgrade")
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 font-semibold transition-all ${className}`}
      >
        <Share2 className="h-4 w-4" />
        {copied ? "Copied!" : isAmbassador ? "Share (tracked)" : "Share"}
      </button>

      <Dialog open={showPromo} onOpenChange={setShowPromo}>
        <DialogContent className="sm:max-w-md p-6" onClick={e => e.stopPropagation()}>
          <DialogHeader className="mb-2">
            <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-900">
              Amplify Your Impact
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 pt-2 font-medium">
              Join the <strong className="text-indigo-600 font-bold">Impact Ambassador</strong> program to get a custom trackable link and see exactly how many donations you inspire, with AI-driven captions!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Primary Action: Become Ambassador */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Level up your sharing</h4>
              {isAuth ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Choose your unique tracking handle</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-white text-slate-400 text-xs font-medium">
                        ?ref=
                      </span>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="rounded-l-none h-10 border-slate-200"
                        placeholder="yourname"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={(e) => { e.stopPropagation(); handleOneClickUpgrade() }}
                    disabled={upgrading || username.length < 3}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 shadow-sm transition-all text-sm"
                  >
                    {upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate Ambassador Link"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/signup?redirect=/campaigns/${campaignId}` }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 shadow-sm transition-all text-sm gap-2"
                >
                  Create free account to activate <Sparkles className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Secondary Action: Standard Share */}
            <div className="relative pt-2">
              <div className="absolute inset-0 items-center flex">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={(e) => { e.stopPropagation(); setShowPromo(false); performShare(true) }}
              className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold shadow-sm bg-white"
            >
              Share Normally (Untracked)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
