import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Trophy, Users, TrendingUp, Activity, Sparkles } from "lucide-react"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"

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

  // Fetch Top NGOs (by active campaigns)
  const { data: topNGOs } = await supabase
    .from("organizations")
    .select("id, name, logo_url")
    .eq("is_verified", true)
    
  // Fetch campaign counts for NGOs
  const { data: ngoCampaignCounts } = await supabase
    .from("campaigns")
    .select("organization_id")
  
  const ngoStats = topNGOs?.map(org => {
     const count = ngoCampaignCounts?.filter(c => c.organization_id === org.id).length || 0
     return { ...org, count }
  }).sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />

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
              {(!topFunded || topFunded.length === 0) ? (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                   No campaigns funded yet.
                </div>
              ) : topFunded.map((campaign: any, idx: number) => (
                <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="block group">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-lg
                      ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' : 
                        idx === 1 ? 'bg-slate-100 text-slate-700' : 
                        idx === 2 ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-400'}
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
              {topSupported.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                   Waiting for the first donation.
                </div>
              ) : topSupported.map((entry, idx: number) => (
                <Link href={`/campaigns/${entry.id}`} key={entry.id} className="block group">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-lg bg-slate-50 text-slate-400
                      ${idx === 0 ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200' : ''}`}>
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

          {/* Most Active NGOs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-700">
                <Activity className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Most Active NGOs</h2>
            </div>
            
            <div className="space-y-6">
              {(!ngoStats || ngoStats.length === 0) ? (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                   No active NGOs found.
                </div>
              ) : ngoStats.map((ngo, idx: number) => (
                <Link href={`/organizations/${ngo.id}`} key={ngo.id} className="block group">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-lg bg-slate-50 text-slate-400
                      ${idx === 0 ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-200' : ''}`}>
                      {idx + 1}
                    </div>
                    <img src={ngo.logo_url} className="h-10 w-10 rounded-full object-cover border border-slate-200" alt={ngo.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                        {ngo.name}
                      </p>
                      <p className="text-sm text-slate-500 truncate uppercase tracking-tighter font-semibold">
                        Verified Partner
                      </p>
                    </div>
                    <div className="font-bold text-purple-700 whitespace-nowrap">
                      {ngo.count} Campaigns
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Impact Growth */}
          <div className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-lg text-yellow-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">Platform Stats</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                 <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Total Impact</p>
                 <p className="text-2xl font-extrabold text-teal-400">₹{popular?.reduce((s, d) => s + ((d.campaigns as any)?.raised_amount || 0), 0)?.toLocaleString('en-IN') || "0"}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                 <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Lives Touched</p>
                 <p className="text-2xl font-extrabold text-blue-400">{popular?.length || 0}+</p>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/10 col-span-2">
                 <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Verified Partners</p>
                 <p className="text-2xl font-extrabold text-purple-400">{topNGOs?.length || 0} Registered NGOs</p>
               </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-slate-400 leading-relaxed italic">
                "Our transparency index ensures every rupee is accounted for. Verified by PhilanthroForge Trust Layer."
              </p>
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

