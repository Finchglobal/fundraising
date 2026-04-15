"use client"

import { Share2, Sparkles, Loader2, Copy, Check, ExternalLink } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useLang } from "@/components/LanguageSwitcher"

interface ShareButtonProps {
  campaignId: string
  campaignTitle: string
  className?: string
}

export function ShareButton({ campaignId, campaignTitle, className = "" }: ShareButtonProps) {
  const supabase = createClient()
  const { t } = useLang()
  
  const [open, setOpen] = useState(false)
  const [isAmbassador, setIsAmbassador] = useState(false)
  const [ambassadorUsername, setAmbassadorUsername] = useState<string | null>(null)
  const [isAuth, setIsAuth] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [username, setUsername] = useState("")
  const [copied, setCopied] = useState(false)
  const [captionIdx, setCaptionIdx] = useState(0)

  const aiCaptions = useMemo(() => [
    `${t("share_caption_1")} "${campaignTitle}":`,
    `${t("share_caption_2")} "${campaignTitle}":`,
    `${t("share_caption_3")} "${campaignTitle}":`,
  ], [t, campaignTitle])

  const baseUrl = typeof window !== "undefined"
    ? `${window.location.origin}/campaigns/${campaignId}`
    : `https://fundraising.philanthroforge.com/campaigns/${campaignId}`

  const trackedUrl = ambassadorUsername ? `${baseUrl}?ref=${ambassadorUsername}` : baseUrl
  const aiCaption = aiCaptions[captionIdx % aiCaptions.length]

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
    setCaptionIdx(Math.floor(Math.random() * aiCaptions.length))
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
    toast.success(t("share_copied"))
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
        if (error.code === "23505") throw new Error(t("error_username_taken") || "Username already taken!")
        throw error
      }
      setIsAmbassador(true)
      setAmbassadorUsername(username)
      toast.success(`🎉 ${t("success_ambassador_active") || "You are now an Impact Ambassador!"}`)
      // Immediately share with new tracked link
      const newUrl = `${baseUrl}?ref=${username}`
      setTimeout(() => doShare(newUrl, aiCaption), 400)
    } catch (e: any) {
      toast.error(e.message || t("error_upgrade_failed") || "Failed to upgrade")
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className={`flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all active:scale-95 ${className}`}
      >
        <Share2 className="h-4 w-4" />
        {isAmbassador ? t("share_btn_tracked") : t("share_btn_normal")}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
          
          {/* ── AMBASSADOR VIEW ─────────────────────────── */}
          {isAmbassador ? (
            <>
              <DialogHeader>
                <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 rotate-3 shadow-lg shadow-indigo-500/10">
                  <Sparkles className="h-6 w-6" />
                </div>
                <DialogTitle className="text-center text-xl font-black text-slate-900 tracking-tight">
                  {t("share_tracked_title")}
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500 pt-1 font-medium">
                  {t("share_tracked_desc")} <span className="text-indigo-600 font-bold">@{ambassadorUsername}</span>
                </DialogDescription>
              </DialogHeader>

              {/* AI Caption Preview */}
              <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 text-sm text-indigo-900 italic font-medium leading-relaxed mt-2 shadow-inner">
                "{aiCaption}"
                <button
                  onClick={() => setCaptionIdx(i => (i + 1) % aiCaptions.length)}
                  className="mt-3 flex items-center gap-1.5 text-[10px] text-indigo-600 hover:text-indigo-800 font-black uppercase tracking-widest transition-colors"
                >
                  <Sparkles className="h-3 w-3" /> {t("share_generate_caption")}
                </button>
              </div>

              {/* Tracked Link Preview */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[10px] text-gray-400 font-mono truncate">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{trackedUrl}</span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => doCopy(trackedUrl, aiCaption)}
                  className="flex-1 h-12 rounded-xl gap-2 border-gray-200 font-bold text-gray-600 hover:border-gray-900 transition-all"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? t("share_copied") : t("share_copy_link")}
                </Button>
                <Button
                  onClick={() => doShare(trackedUrl, aiCaption)}
                  className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-2 font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10 transition-all active:scale-95"
                >
                  <Share2 className="h-4 w-4" /> {t("share_now")}
                </Button>
              </div>
            </>
          ) : (
            /* ── GUEST / NON-AMBASSADOR VIEW ──────────── */
            <>
              <DialogHeader>
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-xl rotate-6 shadow-indigo-500/30">
                  <Sparkles className="h-7 w-7" />
                </div>
                <DialogTitle className="text-center text-xl font-black text-slate-900 tracking-tight">
                  {t("share_modal_title")}
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500 pt-1 font-medium">
                  {t("share_modal_desc")}
                </DialogDescription>
              </DialogHeader>

              {/* Option A: Become Ambassador */}
              <div className="border border-indigo-100 bg-indigo-50/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">A</div>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{t("share_ambassador_opt")}</p>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{t("share_ambassador_desc")}</p>

                {isAuth ? (
                  <div className="space-y-3">
                    <div className="flex group">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-white text-gray-400 text-[10px] font-black uppercase tracking-tighter transition-colors group-focus-within:border-indigo-500 group-focus-within:bg-indigo-50/30 group-focus-within:text-indigo-500">?ref=</span>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        className="rounded-l-none h-10 border-gray-200 text-sm font-bold focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder="yourname"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleOneClickUpgrade() }}
                      disabled={upgrading || username.length < 3}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 h-11 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-indigo-500/10 transition-all active:scale-95"
                    >
                      {upgrading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : t("share_activate")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => { window.location.href = `/signup?redirect=/campaigns/${campaignId}` }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 h-11 text-xs font-black uppercase tracking-widest text-white rounded-xl gap-2 shadow-lg shadow-indigo-500/10 transition-all active:scale-95"
                  >
                    {t("share_create_account")} <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-[10px]"><span className="bg-white px-4 text-gray-400 font-black uppercase tracking-[3px]">Or</span></div>
              </div>

              {/* Option B: Regular Share */}
              <div className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-gray-200 text-gray-500 text-[10px] font-black flex items-center justify-center shrink-0">B</div>
                  <p className="text-sm font-black text-gray-700 uppercase tracking-tight">{t("share_normal_opt")}</p>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{t("share_normal_desc")}</p>
                <Button
                  variant="outline"
                  onClick={() => doShare(baseUrl, `${t("share_supporting_msg") || "I'm supporting"} "${campaignTitle}" ${t("share_on_pf") || "on PhilanthroForge"}:`)}
                  className="w-full h-11 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-900 transition-all text-xs"
                >
                  <Share2 className="h-4 w-4 mr-2" /> {t("share_without_tracking")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
