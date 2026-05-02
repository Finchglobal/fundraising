"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Activity, UsersRound, ReceiptIndianRupee, Plus, FileSpreadsheet, Sparkles, ArrowRight, ShieldCheck, Pencil } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/components/LanguageSwitcher"

export default function DashboardHub() {
  const supabase = createClient()
  const router = useRouter()
  const { t } = useLang()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    orgName: string;
    isVerified: boolean;
    orgId: string | null;
    campaigns: any[];
    appsCount: number;
    pendingDonationsCount: number;
    totalRaised: number;
    platformFee: number;
    recentCampaigns: any[];
  } | null>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      let orgId = null
      let orgName = "Demo NGO"
      let isVerified = false

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, organizations(name, is_verified)")
        .eq("id", user.id)
        .single()
      
      orgId = profile?.organization_id
      orgName = (profile?.organizations as any)?.name || orgName
      isVerified = (profile?.organizations as any)?.is_verified || false



      if (!orgId) {
        setLoading(false)
        return
      }

      // KPIs
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, title, raised_amount, public_goal, status, hero_image_url, created_at")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false }) || { data: [] }

      const { data: apps } = await supabase
        .from("beneficiary_applications")
        .select("id")
        .eq("organization_id", orgId)
        .eq("status", "pending")

      const campaignIds = campaigns?.map(c => c.id) || []
      let pendingDonationsCount = 0
      if (campaignIds.length > 0) {
        const { count } = await supabase
          .from("donations")
          .select("id", { count: 'exact', head: true })
          .in("campaign_id", campaignIds)
          .eq("status", "pending")
        pendingDonationsCount = count || 0
      }

      const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised_amount || 0), 0) || 0
      
      setData({
        orgId,
        orgName,
        isVerified,
        campaigns: campaigns || [],
        appsCount: apps?.length || 0,
        pendingDonationsCount,
        totalRaised,
        platformFee: Math.round(totalRaised * 0.02),
        recentCampaigns: campaigns?.slice(0, 4) || []
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center p-4 font-bold text-slate-400 animate-pulse">{t("dashboard_loading")}</div>

  if (!data?.orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("dashboard_no_orgs")}</h2>
        <p className="text-slate-600 max-w-md">{t("dashboard_no_orgs_desc")}</p>
        <Link href="/onboarding" className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 shadow-lg transition-all active:scale-95">{t("dashboard_register_first")}</Link>
      </div>
    )
  }

  const activeCampaignsCount = data.campaigns.filter(c => c.status === "published").length

  const kpiCards = [
    { label: t("dashboard_kpi_funds_raised"), value: `₹${data.totalRaised.toLocaleString("en-IN")}`, sub: "Across all campaigns", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
    { label: t("dashboard_kpi_active_campaigns"), value: activeCampaignsCount, sub: "Currently live & published", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t("dashboard_kpi_pending_reviews"), value: data.appsCount, sub: "Beneficiary applications to vet", icon: UsersRound, color: "text-amber-600", bg: "bg-amber-50" },
    { label: t("dashboard_kpi_utrs_verify"), value: data.pendingDonationsCount, sub: "Awaiting bank confirmation", icon: ReceiptIndianRupee, color: "text-indigo-600", bg: "bg-indigo-50" },
  ]

  const quickActions = [
    { label: t("dashboard_action_create"), desc: "Launch a new fundraising page", href: "/dashboard/campaigns/new", icon: Plus, color: "bg-teal-600 hover:bg-teal-500 text-white" },
    { label: t("dashboard_action_verify"), desc: "Approve donations & issue receipts", href: "/dashboard/donations", icon: ReceiptIndianRupee, color: "bg-indigo-600 hover:bg-indigo-500 text-white" },
    { label: t("dashboard_action_share"), desc: "Generate social media content", href: "/dashboard/share", icon: Sparkles, color: "bg-purple-600 hover:bg-purple-500 text-white" },
    { label: t("dashboard_action_invoices"), desc: "View your 2% billing summary", href: "/dashboard/invoices", icon: FileSpreadsheet, color: "bg-slate-700 hover:bg-slate-600 text-white" },
  ]

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">{t("dashboard_welcome")} 👋</h1>
          <div className="flex items-center gap-2">
            <p className="text-slate-500 text-sm">{t("dashboard_managing_for")} <strong className="text-slate-700">{data.orgName}</strong></p>
            {data.isVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full border border-teal-200 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" /> {t("dashboard_verified_ngo")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200 uppercase tracking-wider">
                {t("dashboard_pending_review")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verification Nudge for Unverified NGOs */}
      {!data.isVerified && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm">
          <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
             <ShieldCheck className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 leading-tight">{t("dashboard_awaiting_verification_title")}</h3>
            <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
              {t("dashboard_awaiting_verification_desc")}
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
              <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-tight">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Recent Campaigns Grid */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-4">{t("dashboard_quick_actions")}</h2>
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
          {data.totalRaised > 0 && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-800">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4" /> {t("dashboard_invoice_due")}
              </p>
              <p className="text-xs text-indigo-600">
                ₹{data.platformFee.toLocaleString("en-IN")} {t("dashboard_billing_desc")}
              </p>
              <Link href="/dashboard/invoices" className="text-xs font-semibold text-indigo-700 underline mt-1 inline-block">{t("dashboard_view_invoice")} →</Link>
            </div>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">{t("dashboard_recent_campaigns")}</h2>
            <Link href="/dashboard/campaigns/new" className="text-sm text-teal-600 font-semibold hover:underline">+ {t("dashboard_action_create")}</Link>
          </div>

          {data.recentCampaigns.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500">
              <Plus className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="font-semibold">{t("dashboard_no_campaigns")}</p>
              <p className="text-sm mt-1">{t("dashboard_create_first")}</p>
              <Link href="/dashboard/campaigns/new">
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-500 transition-colors">
                  <Plus className="h-4 w-4" /> {t("dashboard_action_create")}
                </div>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentCampaigns.map(c => {
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
