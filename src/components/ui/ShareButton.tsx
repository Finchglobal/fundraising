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

  const performShare = async () => {
    const shareText = `I'm supporting "${campaignTitle}" on PhilanthroForge. Please help:`
    if (navigator.share) {
      try {
        await navigator.share({ title: campaignTitle, text: shareText, url: finalUrl })
      } catch (e) { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${finalUrl}`)
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
    } else if (isAuth) {
      setShowPromo(true)
    } else {
      performShare()
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
        <DialogContent className="sm:max-w-md" onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-900">
              Track your impact!
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 pt-2">
              Become an <strong className="text-indigo-600">Impact Ambassador</strong> to get a custom tracking link and see exactly how many people donate because of <em>you</em>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Your unique tracking username</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-400 text-xs font-medium">
                  ?ref=
                </span>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="rounded-l-none h-10"
                  placeholder="yourname"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
            <Button
              onClick={(e) => { e.stopPropagation(); handleOneClickUpgrade() }}
              disabled={upgrading || username.length < 3}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 shadow-md shadow-indigo-500/20"
            >
              {upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate & Share"}
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={(e) => { e.stopPropagation(); setShowPromo(false); performShare() }}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
            >
              No thanks, share normally
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
