import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { HeartPulse, Trophy, Users, TrendingUp } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // Fetch highest funded campaigns
  const { data: topFunded } = await supabase
    .from("campaigns")
    .select("id, title, raised_amount, organizations(name)")
    .order("raised_amount", { ascending: false })
    .limit(5)

  // Fetch most supported campaigns based on donation count
  const { data: popular } = await supabase
    .from("donations")
    .select("campaign_id, campaigns(title, organizations(name))")
    .eq("status", "verified")

  // Aggregate donation counts in JS (since Supabase JS client doesn't natively group by counting easily without RPC)
  const countMap: Record<string, { count: number, campaign: any }> = {}
  popular?.forEach(d => {
    const cId = d.campaign_id
    if (!countMap[cId]) {
      countMap[cId] = { count: 0, campaign: d.campaigns }
    }
    countMap[cId].count++
  })

  const topSupported = Object.entries(countMap)
    .map(([id, info]) => ({ id, ...info }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-teal-600" />
            <span className="font-bold text-lg text-slate-900">Philanthroforge</span>
          </Link>
        </div>
      </nav>

      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Impact Leaderboard
          </h1>
          <p className="text-lg text-slate-300">
            Celebrating the communities and campaigns that are driving the most change across India.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Top Funded Campaigns */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-teal-100 rounded-lg text-teal-700">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Highest Funds Raised</h2>
            </div>
            
            <div className="space-y-6">
              {topFunded?.map((campaign: any, idx: number) => (
                <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="block group">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-lg
                      ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        idx === 1 ? 'bg-slate-100 text-slate-700' : 
                        idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-400'}
                    `}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                        {campaign.title}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {campaign.organizations?.name}
                      </p>
                    </div>
                    <div className="font-bold text-teal-700 whitespace-nowrap">
                      ₹{campaign.raised_amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Most Supported Campaigns */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-100 rounded-lg text-indigo-700">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Most Donors</h2>
            </div>
            
            <div className="space-y-6">
              {topSupported.map((entry, idx: number) => (
                <Link href={`/campaigns/${entry.id}`} key={entry.id} className="block group">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-lg bg-slate-50 text-slate-400`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {entry.campaign.title}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {entry.campaign.organizations?.name}
                      </p>
                    </div>
                    <div className="font-bold text-indigo-700 whitespace-nowrap">
                      {entry.count} Donors
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t border-slate-800">
          Powered by Philanthroforge Trust Infrastructure.
      </footer>
    </div>
  )
}
