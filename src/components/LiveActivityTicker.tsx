"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Heart } from "lucide-react"
import { useLang } from "@/components/LanguageSwitcher"

export function LiveActivityTicker() {
  const supabase = createClient()
  const { t } = useLang()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      const { data } = await supabase
        .from("donations")
        .select(`
          amount,
          donor_name,
          is_anonymous,
          campaigns ( title )
        `)
        .eq("status", "verified")
        .order("created_at", { ascending: false })
        .limit(5)

      if (data) {
        setActivities(data)
      }
      setLoading(false)
    }

    fetchActivity()

    // Real-time subscription to verified donations
    const channel = supabase
      .channel("live-activity")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "donations",
          filter: "status=eq.verified"
        },
        () => fetchActivity()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading || activities.length === 0) return null

  return (
    <div className="bg-slate-900 border-y border-white/5 py-3 overflow-hidden relative">
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap px-4">
        {/* Doubling the items for safe loop */}
        {[...activities, ...activities].map((activity, idx) => (
          <div key={idx} className="flex items-center gap-3 text-sm">
            <div className="h-6 w-6 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Heart className="h-3 w-3 text-teal-400 fill-teal-400" />
            </div>
            <span className="text-white font-medium">
              {activity.is_anonymous ? t("ticker_someone") : activity.donor_name}
            </span>
            <span className="text-slate-400">{t("ticker_donated")}</span>
            <span className="text-teal-400 font-bold">₹{activity.amount.toLocaleString('en-IN')}</span>
            <span className="text-slate-400">{t("ticker_to")}</span>
            <span className="text-white/80 italic line-clamp-1 max-w-[150px]">
              {activity.campaigns?.title}
            </span>
            <div className="h-1 w-1 rounded-full bg-white/20 mx-4" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
