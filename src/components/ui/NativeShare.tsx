"use client"

import { Share2, Sparkles, Loader2, X } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface NativeShareProps {
  title: string
  text: string
  url: string
  className?: string
}

export function NativeShare({ title, text, url: initialUrl, className = "" }: NativeShareProps) {
  const supabase = createClient()
  const router = useRouter()
  
  const [copied, setCopied] = useState(false)
  const [showPromo, setShowPromo] = useState(false)
  
  // States to track Ambassador status
  const [isAmbassador, setIsAmbassador] = useState(false)
  const [ambassadorUsername, setAmbassadorUsername] = useState<string | null>(null)
  const [isAuth, setIsAuth] = useState(false)
  
  // For one-click sign up inline
  const [upgrading, setUpgrading] = useState(false)
  const [username, setUsername] = useState("")

  useEffect(() => {
    async function checkStatus() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsAuth(true)
        const { data: profile } = await supabase.from("profiles").select("is_ambassador, ambassador_username").eq("id", session.user.id).single()
        if (profile?.is_ambassador) {
          setIsAmbassador(true)
          setAmbassadorUsername(profile.ambassador_username)
        }
      }
    }
    checkStatus()
  }, [])

  // Create final URL
  const finalUrl = isAmbassador && ambassadorUsername 
    ? `${initialUrl}${initialUrl.includes('?') ? '&' : '?'}ref=${ambassadorUsername}` 
    : initialUrl;

  const performShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: finalUrl })
      } catch (error) {
        console.error("Error sharing", error)
      }
    } else {
      navigator.clipboard.writeText(`${text} ${finalUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareClick = () => {
    // If they are an ambassador or not logged in at all, just share
    // (If not logged in, we could prompt login, but we don't want to block organic sharing completely)
    if (isAmbassador) {
      performShare()
    } else {
      // If logged in but NOT an ambassador, show the 1-click upgrade prompt
      if (isAuth) {
        setShowPromo(true)
      } else {
        performShare() // Just share normally if unauthed, to remove friction
      }
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
      toast.success("Welcome to the Ambassador Program! Your link is now tracked.")
      
      // Auto-trigger the share now that they are upgraded
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
        onClick={handleShareClick}
        className={`flex items-center justify-center gap-2 font-semibold transition-all ${className}`}
      >
        <Share2 className="h-4 w-4" />
        {copied ? "Copied!" : "Share"}
      </button>

      <Dialog open={showPromo} onOpenChange={setShowPromo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-900">Wait! Track your impact.</DialogTitle>
            <DialogDescription className="text-center text-slate-600 pt-2">
              Instead of just sharing a generic link, become an <strong className="text-indigo-600">Impact Ambassador</strong> right now. 
              Get a custom tracking link to see exactly how many people donate because of you!
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Choose your unique tracking username</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-400 text-xs font-medium">
                  ?ref=
                </span>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="rounded-l-none h-10"
                  placeholder="yourname"
                />
              </div>
            </div>

            <Button
              onClick={handleOneClickUpgrade}
              disabled={upgrading || username.length < 3}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 shadow-md shadow-indigo-500/20"
            >
              {upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate tracking & Share"}
            </Button>
          </div>

          <div className="text-center mt-2">
            <button 
              onClick={() => { setShowPromo(false); performShare(); }}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
            >
              No thanks, I just want to share normally right now
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
