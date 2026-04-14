import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Activity, UsersRound, ReceiptIndianRupee, Plus, FileSpreadsheet, Sparkles, ArrowRight, ShieldCheck, Pencil } from "lucide-react"
import Link from "next/link"

export default async function DashboardHub() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const { redirect } = await import("next/navigation")
    redirect("/login")
  }
  
  let orgId = null
  let orgName = "Demo NGO"
  let isVerified = false

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, organizations(name, is_verified)")
      .eq("id", user.id)
      .single()
    orgId = profile?.organization_id
    orgName = (profile?.organizations as any)?.name || orgName
    isVerified = (profile?.organizations as any)?.is_verified || false
  }

  // Fallback for MVP Presentation if no org linked to profile
  if (!orgId) {
    const { data: fallbackOrg } = await supabase.from("organizations").select("id, name, is_verified").limit(1).single()
    orgId = fallbackOrg?.id
    orgName = fallbackOrg?.name || orgName
    isVerified = fallbackOrg?.is_verified || false
  }

  // If truly no org found in DB
  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Organizations Found</h2>
        <p className="text-slate-600 max-w-md">There are no organizations registered in the system yet.</p>
        <Link href="/onboarding" className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 shadow-lg transition-all active:scale-95">Register First NGO</Link>
      </div>
    )
  }

  // KPIs
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, raised_amount, public_goal, status, hero_image_url, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })

  const { data: apps } = await supabase
    .from("beneficiary_applications")
    .select("id")
    .eq("organization_id", orgId)
    .eq("status", "pending")

  const campaignIds = campaigns?.map(c => c.id) || []
  let pendingDonations: any[] | null = []
  if (campaignIds.length > 0) {
    const { data: pDonations } = await supabase
      .from("donations")
      .select("id")
      .in("campaign_id", campaignIds)
      .eq("status", "pending")
    pendingDonations = pDonations
  }

  const activeCampaigns = campaigns?.filter(c => c.status === "published") || []
  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised_amount || 0), 0) || 0
  const platformFee = Math.round(totalRaised * 0.02)
  const recentCampaigns = campaigns?.slice(0, 4) || []

  const kpiCards = [
    { label: "Total Funds Raised", value: `₹${totalRaised.toLocaleString("en-IN")}`, sub: "Across all campaigns", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Active Campaigns", value: activeCampaigns.length, sub: "Currently live & published", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Reviews", value: apps?.length || 0, sub: "Beneficiary applications to vet", icon: UsersRound, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "UTRs to Verify", value: pendingDonations?.length || 0, sub: "Awaiting bank confirmation", icon: ReceiptIndianRupee, color: "text-indigo-600", bg: "bg-indigo-50" },
  ]

  const quickActions = [
    { label: "Create Campaign", desc: "Launch a new fundraising page", href: "/dashboard/campaigns/new", icon: Plus, color: "bg-teal-600 hover:bg-teal-500 text-white" },
    { label: "Verify UTRs", desc: "Approve donations & issue receipts", href: "/dashboard/donations", icon: ReceiptIndianRupee, color: "bg-indigo-600 hover:bg-indigo-500 text-white" },
    { label: "AI Share Studio", desc: "Generate social media content", href: "/dashboard/share", icon: Sparkles, color: "bg-purple-600 hover:bg-purple-500 text-white" },
    { label: "Platform Invoices", desc: "View your 2% billing summary", href: "/dashboard/invoices", icon: FileSpreadsheet, color: "bg-slate-700 hover:bg-slate-600 text-white" },
  ]

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Welcome back 👋</h1>
          <div className="flex items-center gap-2">
            <p className="text-slate-500 text-sm">Managing campaigns for <strong className="text-slate-700">{orgName}</strong></p>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full border border-teal-200 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" /> Verified NGO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200 uppercase tracking-wider">
                Pending Review
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verification Nudge for Unverified NGOs */}
      {!isVerified && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm">
          <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
             <ShieldCheck className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 leading-tight">Your NGO is awaiting verification</h3>
            <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
              Our compliance team is currently reviewing your application. You can create campaigns and simulate donations, but they won't be visible to the public until your account is approved.
            </p>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpiCards.map(card => (
          <Card key={card.label} className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className={`text-3xl font-extrabold ${card.color}`}>{card.value}</div>
              <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Recent Campaigns Grid */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map(action => (
              <Link key={action.href} href={action.href}>
                <div className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${action.color} group`}>
                  <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{action.label}</p>
                    <p className="text-xs opacity-80">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>


          {/* Platform Fee Nudge */}
          {totalRaised > 0 && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-800">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4" /> Invoice Due
              </p>
              <p className="text-xs text-indigo-600">
                ₹{platformFee.toLocaleString("en-IN")} (2% platform fee) is billable based on funds raised.
              </p>
              <Link href="/dashboard/invoices" className="text-xs font-semibold text-indigo-700 underline mt-1 inline-block">View Invoice →</Link>
            </div>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Campaigns</h2>
            <Link href="/dashboard/campaigns/new" className="text-sm text-teal-600 font-semibold hover:underline">+ New Campaign</Link>
          </div>

          {recentCampaigns.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500">
              <Plus className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="font-semibold">No campaigns yet</p>
              <p className="text-sm mt-1">Create your first fundraising campaign to get started.</p>
              <Link href="/dashboard/campaigns/new">
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-500 transition-colors">
                  <Plus className="h-4 w-4" /> Create Campaign
                </div>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCampaigns.map(c => {
                const progress = Math.min(((c.raised_amount || 0) / c.public_goal) * 100, 100)
                return (
                  <div key={c.id} className="flex gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-sm transition-all group relative">
                    <Link href={`/campaigns/${c.id}`} target="_blank" className="shrink-0">
                      <img
                        src={c.hero_image_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=60"}
                        alt={c.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 pr-12 relative">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/campaigns/${c.id}`} target="_blank" className="font-semibold text-slate-900 line-clamp-1 hover:text-teal-700 transition-colors">
                          {c.title}
                        </Link>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          c.status === "published" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-slate-700">₹{(c.raised_amount || 0).toLocaleString("en-IN")} raised</span>
                          <span>of ₹{c.public_goal.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/campaigns/${c.id}/edit`} className="p-2 bg-slate-100 text-slate-600 hover:bg-teal-600 hover:text-white rounded-lg transition-all" title="Edit Fundraiser">
                           <Pencil className="h-4 w-4" />
                        </Link>
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
