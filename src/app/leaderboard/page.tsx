import { createClient } from "@/lib/supabase/server"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { Trophy, Sparkles, TrendingUp, Medal } from "lucide-react"
import Link from "next/link"
import { TranslatedText } from "@/components/TranslatedText"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // Note: For a true leaderboard, you'd aggregate the `donations` table group by `referrer_id` in SQL 
  // via a database view or RPC, but since we are rapidly iterating, we can fetch ambassadors and their impact.
  // In production with millions of rows, use a materialized view.

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, ambassador_username, full_name, is_ambassador, donations!donations_referrer_id_fkey(amount, status)")
    .eq("is_ambassador", true)

  const rawLeaders = profiles?.map(p => {
    const verifiedDonations = p.donations?.filter((d: any) => d.status === "verified") || []
    return {
      id: p.id,
      username: p.ambassador_username,
      name: p.full_name || `@${p.ambassador_username}`,
      totalRaised: verifiedDonations.reduce((sum: number, d: any) => sum + Number(d.amount), 0),
      donorsMobilized: verifiedDonations.length
    }
  }) || []

  // Top 10 by Funds Raised
  const topByFunds = [...rawLeaders].sort((a, b) => b.totalRaised - a.totalRaised).slice(0, 10).filter(l => l.totalRaised > 0)
  
  // Top 10 by Donors
  const topByDonors = [...rawLeaders].sort((a, b) => b.donorsMobilized - a.donorsMobilized).slice(0, 10).filter(l => l.donorsMobilized > 0)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />
      
      {/* Hero */}
      <div className="bg-slate-900 border-b border-indigo-500/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10">
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"><TranslatedText tKey="impact_leaderboard" /></h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            <TranslatedText tKey="leaderboard_desc" />          </p>
          <Link
            href="/ambassador/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="h-5 w-5" /> <TranslatedText tKey="become_ambassador" />          </Link>
        </div>
      </div>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full -mt-8 relative z-20">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Category 1: Most Funds Raised */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Medal className="h-6 w-6 text-yellow-500" /> <TranslatedText tKey="most_funds_raised" />              </h2>
              <p className="text-sm text-slate-500 mt-1"><TranslatedText tKey="funds_raised_desc" /></p>
            </div>
            <div className="p-0">
              {topByFunds.length > 0 ? topByFunds.map((leader, i) => (
                <Link key={leader.id} href={`/ambassador/${leader.username}`} className="flex items-center gap-4 p-4 md:p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{leader.name}</h3>
                    <div className="text-xs text-slate-500 truncate">@{leader.username}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-slate-900">₹{leader.totalRaised.toLocaleString('en-IN')}</div>
                  </div>
                </Link>
              )) : (
                <div className="p-8 text-center text-slate-400 font-medium"><TranslatedText tKey="no_impact_yet" /></div>
              )}
            </div>
          </div>

          {/* Category 2: Most Donors Mobilized */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-emerald-500" /> <TranslatedText tKey="donors_mobilized" />              </h2>
              <p className="text-sm text-slate-500 mt-1"><TranslatedText tKey="donors_mobilized_desc" /></p>
            </div>
            <div className="p-0">
              {topByDonors.length > 0 ? topByDonors.map((leader, i) => (
                <Link key={leader.id} href={`/ambassador/${leader.username}`} className="flex items-center gap-4 p-4 md:p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 group">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{leader.name}</h3>
                    <div className="text-xs text-slate-500 truncate">@{leader.username}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-slate-900">{leader.donorsMobilized} <span className="text-xs font-normal text-slate-500"><TranslatedText tKey="donors_label" /></span></div>                  </div>
                </Link>
              )) : (
                <div className="p-8 text-center text-slate-400 font-medium"><TranslatedText tKey="no_impact_yet" /></div>
              )}
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
