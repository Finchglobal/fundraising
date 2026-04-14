import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, TrendingUp, Copy, ExternalLink, Trophy, Crown } from "lucide-react"
import Link from "next/link"

export default async function AmbassadorDashboard() {
  const supabase = await createClient()

  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) redirect("/login?redirect=/ambassador/dashboard")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (!profile?.is_ambassador) {
    redirect("/ambassador/onboarding")
  }

  // Fetch stats (Donations referred by this ambassador)
  const { data: referrals } = await supabase
    .from("donations")
    .select("id, amount, status, created_at, donor_name")
    .eq("referrer_id", profile.id)
    .eq("status", "verified")

  const totalRaised = referrals?.reduce((sum, d) => sum + Number(d.amount), 0) || 0
  const uniqueDonors = new Set(referrals?.map(d => d.donor_name)).size

  // Fetch active campaigns to promote
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, hero_image_url")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Ambassador HQ</h1>
            <p className="text-slate-500 mt-1">
              Your tracking username: <strong className="text-indigo-600">@{profile.ambassador_username}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/ambassador/${profile.ambassador_username}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> View Public Profile
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-100 transition-colors"
            >
              <Trophy className="h-4 w-4" /> Leaderboard
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign className="h-16 w-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-slate-900">₹{totalRaised.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users className="h-16 w-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Donors Mobilized</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-slate-900">{uniqueDonors}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Crown className="h-16 w-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-indigo-100 uppercase tracking-wider">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{totalRaised > 100000 ? "Gold Forge" : totalRaised > 10000 ? "Silver Spark" : "Impact Starter"}</div>
              <p className="text-xs text-indigo-200 mt-1">Keep sharing to level up!</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Campaigns to Promote */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">Promote Top Campaigns</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {campaigns?.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <img src={c.hero_image_url} alt={c.title} className="h-32 w-full object-cover" />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2">{c.title}</h3>
                <div className="mt-auto space-y-2">
                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 font-mono truncate">
                    philanthroforge.com/campaigns/{c.id}?ref={profile.ambassador_username}
                  </div>
                  <Link 
                    href={`/campaigns/${c.id}`}
                    className="flex justify-center w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
                  >
                    Go to Campaign
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
