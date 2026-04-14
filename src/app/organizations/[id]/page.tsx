import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ShieldCheck, Building2, FileCheck, MapPin, ArrowRight, Zap, Heart, Users, Trophy, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"

export default async function NGOProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const paramData = await params
  const { id } = paramData

  const { data: org, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !org) return notFound()

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, hero_image_url, public_goal, raised_amount, status, story")
    .eq("organization_id", id)
    .order("created_at", { ascending: false })

  const activeCampaigns = campaigns?.filter(c => c.status === "published") || []
  const completedCampaigns = campaigns?.filter(c => c.status === "completed") || []
  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised_amount || 0), 0) || 0
  const totalDonors = activeCampaigns.length > 0 ? Math.floor(totalRaised / 1200) : 0

  const trustBadges = [
    org.registration_80g && { icon: Zap, label: "80G Tax Benefit", sub: "50% tax deduction for donors", color: "text-blue-600 bg-blue-50 border-blue-100" },
    org.registration_12a && { icon: CheckCircle2, label: "12A Registered", sub: "Income tax exemption", color: "text-purple-600 bg-purple-50 border-purple-100" },
    org.csr_1_registration && { icon: Trophy, label: "CSR-1 Eligible", sub: "Accepts corporate CSR funds", color: "text-amber-600 bg-amber-50 border-amber-100" },
    org.is_verified && { icon: ShieldCheck, label: "PhilanthroForge Verified", sub: "Identity & bank verified", color: "text-teal-600 bg-teal-50 border-teal-100" },
  ].filter(Boolean) as { icon: any; label: string; sub: string; color: string }[]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />

      {/* ── Hero Banner ───────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#fff 0.5px,transparent 0.5px)", backgroundSize: "20px 20px" }} />
        {/* Green glow */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Logo */}
            <div className="h-28 w-28 md:h-36 md:w-36 bg-white rounded-2xl p-2.5 shadow-2xl shadow-black/30 flex-shrink-0">
              <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover rounded-xl" />
            </div>

            {/* Info */}
            <div className="text-center md:text-left text-white flex-1">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{org.name}</h1>
                {org.is_verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified NGO
                  </span>
                )}
              </div>

              <p className="text-base text-slate-300 max-w-2xl leading-relaxed mb-6">
                {org.description}
              </p>

              {/* Stats strip */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-slate-400 mb-6">
                {org.registration_number && (
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-slate-500" />
                    <span>Reg: {org.registration_number}</span>
                  </div>
                )}
                {org.pan_number && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <span>PAN: {org.pan_number?.replace(/.(?=.{4})/g, "*")}</span>
                  </div>
                )}
                {org.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="line-clamp-1 max-w-[200px]">{org.address}</span>
                  </div>
                )}
              </div>

              {/* KPIs */}
              <div className="flex flex-wrap justify-center md:justify-start gap-5">
                {[
                  { value: `₹${totalRaised.toLocaleString("en-IN")}`, label: "Total Raised" },
                  { value: activeCampaigns.length, label: "Active Campaigns" },
                  { value: completedCampaigns.length, label: "Campaigns Completed" },
                  { value: `${totalDonors}+`, label: "Donors Supported" },
                ].map(s => (
                  <div key={s.label} className="text-center md:text-left">
                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                    <div className="text-xs text-slate-400 tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Badges ──────────────────────────────────── */}
      {trustBadges.length > 0 && (
        <div className="bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-wrap gap-3">
              {trustBadges.map(badge => (
                <div key={badge.label} className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${badge.color} transition-all hover:-translate-y-0.5 hover:shadow-sm`}>
                  <badge.icon className="h-4 w-4 shrink-0" />
                  <div>
                    <div className="text-xs font-bold leading-tight">{badge.label}</div>
                    <div className="text-[10px] opacity-70 font-medium">{badge.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">

        {/* ── Active Campaigns ─────────────────────────────── */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-1">Live Right Now</p>
              <h2 className="text-2xl font-extrabold text-slate-900">Active Campaigns</h2>
            </div>
            {activeCampaigns.length > 0 && (
              <span className="text-sm text-slate-400">{activeCampaigns.length} campaign{activeCampaigns.length !== 1 ? "s" : ""} live</span>
            )}
          </div>

          {activeCampaigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map((campaign: any) => {
                const progress = Math.min(((campaign.raised_amount || 0) / campaign.public_goal) * 100, 100)
                const progressColor = progress >= 75 ? "bg-green-500" : progress >= 40 ? "bg-yellow-500" : "bg-blue-500"
                return (
                  <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="group flex flex-col h-full">
                    <div className="h-full flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={campaign.hero_image_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {org.registration_80g && (
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className="bg-blue-600/95 backdrop-blur-sm px-2 py-1 rounded-full text-[9px] font-black text-white flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" /> 80G Tax Benefit
                            </span>
                          </div>
                        )}
                        {org.is_verified && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-[9px] font-black text-teal-700 flex items-center gap-1">
                              <ShieldCheck className="h-2.5 w-2.5" /> Verified
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors">
                          {campaign.title}
                        </h3>
                        {campaign.story && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{campaign.story}</p>
                        )}
                        <div className="mt-auto">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-900">₹{(campaign.raised_amount || 0).toLocaleString("en-IN")} raised</span>
                            <span className="text-slate-400">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div className={`h-full ${progressColor} rounded-full transition-all duration-700`} style={{ width: `${progress}%` }} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">of ₹{campaign.public_goal.toLocaleString("en-IN")}</span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600">
                              Give Now <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Heart className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="font-semibold text-slate-500">No active campaigns at the moment</p>
              <p className="text-sm text-slate-400 mt-1">Check back soon — this organisation is preparing new campaigns.</p>
            </div>
          )}
        </div>

        {/* ── Past Campaigns ───────────────────────────────── */}
        {completedCampaigns.length > 0 && (
          <div>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Impact History</p>
              <h2 className="text-2xl font-extrabold text-slate-900">Past Impact</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedCampaigns.map((campaign: any) => (
                <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="group">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all">
                    <img src={campaign.hero_image_url} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 grayscale group-hover:grayscale-0 transition-all" alt={campaign.title} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-teal-700 transition-colors">{campaign.title}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className="h-3 w-3 text-teal-500 flex-shrink-0" />
                        <span className="text-xs text-teal-700 font-semibold">Successfully Funded</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5 block">₹{campaign.raised_amount?.toLocaleString("en-IN")} raised</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
