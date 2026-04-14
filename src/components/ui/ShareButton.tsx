"use client"

import { Share2, Sparkles, Loader2, Copy, Check, ExternalLink } from "lucide-react"
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

const AI_CAPTIONS = (title: string) => [
  `I'm backing trust-first giving on PhilanthroForge 💚 Join me in supporting "${title}":`,
  `Impact requires action. I just backed this verified NGO campaign — "${title}":`,
  `Transparency matters in giving. Help me fund "${title}" via PhilanthroForge:`,
  `Every rupee goes directly to the cause. I'm supporting "${title}" — join my impact circle:`,
  `Real change, verified by experts. Let's make a difference together for "${title}":`,
  `I chose PhilanthroForge because 0% goes to fees. Help me fund "${title}" today:`,
]

export function ShareButton({ campaignId, campaignTitle, className = "" }: ShareButtonProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [isAmbassador, setIsAmbassador] = useState(false)
  const [ambassadorUsername, setAmbassadorUsername] = useState<string | null>(null)
  const [isAuth, setIsAuth] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [username, setUsername] = useState("")
  const [copied, setCopied] = useState(false)
  const [captionIdx, setCaptionIdx] = useState(0)

  const baseUrl = typeof window !== "undefined"
    ? `${window.location.origin}/campaigns/${campaignId}`
    : `https://fundraising.philanthroforge.com/campaigns/${campaignId}`

  const trackedUrl = ambassadorUsername ? `${baseUrl}?ref=${ambassadorUsername}` : baseUrl
  const aiCaption = AI_CAPTIONS(campaignTitle)[captionIdx]

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

  // Rotate AI caption each time dialog opens
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCaptionIdx(Math.floor(Math.random() * AI_CAPTIONS(campaignTitle).length))
    setOpen(true)
  }

  const doShare = async (url: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: campaignTitle, text, url })
      } catch (e) { /* user cancelled */ }
    } else {
      await doCopy(url, text)
    }
    setOpen(false)
  }

  const doCopy = async (url: string, text: string) => {
    await navigator.clipboard.writeText(`${text} ${url}`)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2500)
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
        if (error.code === "23505") throw new Error("Username already taken!")
        throw error
      }
      setIsAmbassador(true)
      setAmbassadorUsername(username)
      toast.success("🎉 You are now an Impact Ambassador!")
      // Immediately share with new tracked link
      const newUrl = `${baseUrl}?ref=${username}`
      setTimeout(() => doShare(newUrl, aiCaption), 400)
    } catch (e: any) {
      toast.error(e.message || "Failed to upgrade")
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className={`flex items-center justify-center gap-2 font-semibold transition-all ${className}`}
      >
        <Share2 className="h-4 w-4" />
        {isAmbassador ? "Share (tracked)" : "Share"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" onClick={e => e.stopPropagation()}>
          
          {/* ── AMBASSADOR VIEW ─────────────────────────── */}
          {isAmbassador ? (
            <>
              <DialogHeader>
                <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6" />
                </div>
                <DialogTitle className="text-center text-xl font-black text-slate-900">
                  Your Tracked Share
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500 pt-1">
                  Every click on your link is attributed to <span className="text-indigo-600 font-bold">@{ambassadorUsername}</span>
                </DialogDescription>
              </DialogHeader>

              {/* AI Caption Preview */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900 italic leading-relaxed mt-2">
                "{aiCaption}"
                <button
                  onClick={() => setCaptionIdx(i => (i + 1) % AI_CAPTIONS(campaignTitle).length)}
                  className="mt-2 flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700 font-bold not-italic non-italic transition-colors"
                >
                  <Sparkles className="h-3 w-3" /> Generate another caption
                </button>
              </div>

              {/* Tracked Link Preview */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono truncate">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{trackedUrl}</span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => doCopy(trackedUrl, aiCaption)}
                  className="flex-1 gap-2 border-slate-200 font-bold"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button
                  onClick={() => doShare(trackedUrl, aiCaption)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold"
                >
                  <Share2 className="h-4 w-4" /> Share Now
                </Button>
              </div>
            </>
          ) : (
            /* ── GUEST / NON-AMBASSADOR VIEW ──────────── */
            <>
              <DialogHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
                  <Sparkles className="h-6 w-6" />
                </div>
                <DialogTitle className="text-center text-xl font-black text-slate-900">
                  How would you like to share?
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500 pt-1">
                  Become an <span className="text-indigo-600 font-bold">Impact Ambassador</span> to track every donation you inspire with a personal link.
                </DialogDescription>
              </DialogHeader>

              {/* Option A: Become Ambassador */}
              <div className="border-2 border-indigo-200 bg-indigo-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">A</div>
                  <p className="text-sm font-bold text-slate-800">Become an Impact Ambassador</p>
                </div>
                <p className="text-xs text-slate-500 pl-8">Get a trackable link + AI captions. See exactly how many people donate because of you.</p>

                {isAuth ? (
                  <div className="pl-8 space-y-2">
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-white text-slate-400 text-xs font-mono">?ref=</span>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        className="rounded-l-none h-9 border-slate-200 text-sm"
                        placeholder="yourname"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleOneClickUpgrade() }}
                      disabled={upgrading || username.length < 3}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 h-9 text-sm font-bold"
                    >
                      {upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate & Share →"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => { window.location.href = `/signup?redirect=/campaigns/${campaignId}` }}
                    className="w-full ml-8 bg-indigo-600 hover:bg-indigo-700 h-9 text-sm font-bold gap-2 mt-1"
                    style={{ marginLeft: "2rem", width: "calc(100% - 2rem)" }}
                  >
                    Create free account <Sparkles className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400 font-bold uppercase tracking-widest">Or</span></div>
              </div>

              {/* Option B: Regular Share */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs font-black flex items-center justify-center shrink-0">B</div>
                  <p className="text-sm font-bold text-slate-700">Share Normally</p>
                </div>
                <p className="text-xs text-slate-400 pl-8">Share the campaign link without tracking. No account needed.</p>
                <Button
                  variant="outline"
                  onClick={() => doShare(baseUrl, `I'm supporting "${campaignTitle}" on PhilanthroForge:`)}
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-9 text-sm font-bold gap-2"
                >
                  <Share2 className="h-4 w-4" /> Share Without Tracking
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
