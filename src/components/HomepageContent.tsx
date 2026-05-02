"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  ShieldCheck, QrCode, HeartPulse, ArrowRight, Trophy, Users, TrendingUp,
  Zap, Star, CheckCircle2, Globe2, Landmark, BadgeCheck, Share2, FileText,
  PhoneCall, IndianRupee, Sparkles
} from "lucide-react"
import { useLang } from "@/components/LanguageSwitcher"
import { ShareButton } from "@/components/ui/ShareButton"

interface Campaign {
  id: string
  title: string
  hero_image_url: string
  public_goal: number
  raised_amount: number
  story: string
  organization_id: string
  organizations: { name: string; is_verified: boolean; registration_80g: boolean } | null
}

interface HomepageContentProps {
  campaigns: Campaign[]
  featuredCampaigns: Campaign[]
  totalRaised: number
  raisedThisMonth: number
  verifiedNgoCount: number
}

export function HomepageContent({ campaigns, featuredCampaigns, totalRaised, raisedThisMonth, verifiedNgoCount }: HomepageContentProps) {
  const { t } = useLang()

  return (
    <>
      {/* ── HERO — AWWWARDS Editorial ─────────────────────────── */}
      <section id="hero" className="relative min-h-screen bg-gradient-to-br from-teal-950 via-emerald-900 to-green-950 overflow-hidden flex items-center">

        {/* Giant ghost manifesto text */}
        <div className="absolute inset-0 flex items-end justify-start overflow-hidden select-none pointer-events-none px-4 pb-4">
          <span className="text-[22vw] font-black leading-none tracking-tighter text-white/[0.04] whitespace-nowrap">GIVE.TRUST.</span>
        </div>

        {/* Glowing aura blobs */}
        <div className="absolute -top-40 right-0 w-[700px] h-[700px] bg-emerald-400/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-300/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Dot matrix accent */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 0.5px, transparent 0.5px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[1fr_1.1fr] gap-10 min-h-screen items-center py-24 lg:py-0">

          {/* ── LEFT: Full editorial image ──────────────────────── */}
          <div className="relative hidden lg:flex items-center self-stretch py-16">
            <div className="relative w-full h-full max-h-[78vh] rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
              <img
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2000&auto=format&fit=crop"
                alt="PhilanthroForge — Real Impact"
                className="w-full h-full object-cover"
              />
              {/* Subtle bottom vignette for the card */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

              {/* Live donation floating card */}
              <div className="absolute bottom-6 left-6 bg-white/96 backdrop-blur-xl shadow-2xl rounded-2xl p-4 flex items-center gap-4 max-w-[260px] border border-white/60">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl flex-shrink-0">💚</div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Just donated</div>
                  <div className="font-black text-gray-900 text-sm">₹1,100 → Clean Water</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">80G receipt sent ✓</div>
                </div>
              </div>

              {/* Top-right trust badge */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl px-4 py-3 flex flex-col items-center border border-white/50">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mb-1" />
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-800">PF Verified</div>
              </div>
            </div>

            {/* Floating side stat */}
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-indigo-500/30 rounded-2xl px-4 py-5 flex flex-col items-center gap-0.5">
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-indigo-100">Tax Benefit</div>
            </div>
          </div>

          {/* ── RIGHT: Text Content ──────────────────────────────── */}
          <div className="flex flex-col justify-center lg:pl-6 py-12 lg:py-20">

            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-widest uppercase text-emerald-300 bg-white/10 rounded-full border border-white/15 backdrop-blur-sm w-fit">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("hero_verified_tag")}
            </div>

            {/* Headline — editorial manifesto style */}
            <h1 className="font-black text-white tracking-tight leading-[0.9] mb-7" style={{ fontSize: 'clamp(3.5rem, 7vw, 6rem)' }}>
              {t("real_impact")}<span className="text-emerald-400">.</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400">
                {t("real_trust")}<span className="text-yellow-300">.</span>
              </span>
            </h1>

            {/* Rule + subtitle */}
            <div className="flex items-start gap-4 mb-10">
              <div className="w-1 h-16 bg-gradient-to-b from-emerald-400 to-transparent rounded-full flex-shrink-0 mt-1" />
              <p className="text-lg text-emerald-100/70 leading-relaxed max-w-md">
                {t("hero_subtitle")}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-12">
              <a
                href="#campaigns"
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black px-8 py-4 rounded-2xl text-base transition-all duration-300 hover:shadow-[0_0_40px_rgba(250,204,21,0.5)] hover:-translate-y-0.5"
              >
                {t("donate_now")} <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-7 py-4 rounded-2xl text-base border border-white/20 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
              >
                {t("join_supporter")}
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center text-emerald-300/80 hover:text-white font-semibold px-5 py-4 text-base transition-colors"
              >
                {t("ngo_onboarding")} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            {/* Stats — bold editorial numbers */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
              {[
                { value: `₹${Math.floor(raisedThisMonth).toLocaleString('en-IN')}+`, label: t("stat_raised_month") },
                { value: `${verifiedNgoCount}+`, label: t("stat_verified_orgs") },
                { value: "0%", label: t("stat_gateway_fees") },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-3xl font-black text-white leading-none">{stat.value}</div>
                  <div className="text-xs text-emerald-300/60 mt-1.5 font-medium leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Mobile image */}
            <div className="lg:hidden mt-10 rounded-3xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2000&auto=format&fit=crop" alt="PhilanthroForge Impact" className="w-full object-cover max-h-72" />
            </div>
          </div>

        </div>
      </section>

      {/* ── WHY PHILANTHROFORGE — NEW USP SECTION ────────────────── */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#16a34a 0.5px, transparent 0.5px)', backgroundSize: '22px 22px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-teal-900/10">
              <img
                src="/donation_upi_scene.png"
                alt="Indian families donating via UPI"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex gap-3">
                  <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-green-700 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    <ShieldCheck className="h-3 w-3" /> 100% Verified NGOs
                  </span>
                  <span className="flex items-center gap-1.5 bg-green-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    <IndianRupee className="h-3 w-3" /> Zero Platform Fees
                  </span>
                </div>
              </div>
            </div>
            {/* Right: USPs */}
            <div>
              <p className="text-xs font-black tracking-widest uppercase text-green-600 mb-3">Why PhilanthroForge</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-6">India's Most Trusted <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">Giving Platform</span></h2>
              <p className="text-gray-500 mb-10 leading-relaxed text-base">We verify every NGO, eliminate payment friction with UPI, and give you real-time proof of impact — so your rupee always reaches those who need it most.</p>
              <div className="space-y-5">
                {[
                  { icon: BadgeCheck, color: "text-green-600 bg-green-50", title: "Government-Registered NGOs Only", desc: "Every partner NGO holds valid 12A, 80G, or CSR-1 registration — vetted by our trust team." },
                  { icon: QrCode, color: "text-blue-600 bg-blue-50", title: "Instant UPI Donations", desc: "No payment gateway, no hidden fees. Scan a QR and donate directly — 100% reaches the cause." },
                  { icon: FileText, color: "text-purple-600 bg-purple-50", title: "80G Tax Certificates", desc: "Download your Section 80G receipt instantly — making every donation tax-deductible." },
                  { icon: Share2, color: "text-indigo-600 bg-indigo-50", title: "Grassroots Ambassador Program", desc: "Become an Impact Ambassador — share campaigns and watch your tracked referrals create change." },
                ].map(usp => (
                  <div key={usp.title} className="flex items-start gap-4 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${usp.color} group-hover:scale-110 transition-transform duration-300`}>
                      <usp.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5">{usp.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{usp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT BY THE NUMBERS ─────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#22c55e 0.5px, transparent 0.5px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <p className="text-xs font-black tracking-widest uppercase text-green-400 mb-3">Impact By Numbers</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-14">Every Rupee. Tracked. Verified. Impactful.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: `₹${Math.floor(totalRaised).toLocaleString('en-IN')}+`, label: "Platform Impact", icon: IndianRupee, color: "from-green-500/20 to-green-600/10 border-green-500/20 text-green-400" },
              { value: `${verifiedNgoCount}+`, label: "Verified NGOs", icon: BadgeCheck, color: "from-teal-500/20 to-teal-600/10 border-teal-500/20 text-teal-400" },
              { value: "0%", label: "Platform / Gateway Fees", icon: Star, color: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/20 text-yellow-400" },
              { value: "80G", label: "Tax Benefit on All Donations", icon: Landmark, color: "from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400" },
            ].map(stat => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-6 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform duration-300`}>
                <stat.icon className="h-7 w-7 opacity-80" />
                <div className="text-4xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 font-medium text-center">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE ECOSYSTEM — MULTI-LAYERED IMPACT ───────────────────── */}
      <section className="py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">{t("eco_title")}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
              {t("eco_subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: t("eco_ngo_title"), 
                desc: t("eco_ngo_desc"), 
                cta: t("eco_ngo_cta"), 
                href: "/onboarding", 
                icon: Landmark, 
                color: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
                iconColor: "text-emerald-600 bg-emerald-50"
              },
              { 
                title: t("eco_campaign_title"), 
                desc: t("eco_campaign_desc"), 
                cta: t("eco_campaign_cta"), 
                href: "#campaigns", 
                icon: HeartPulse, 
                color: "from-blue-500 to-indigo-600 shadow-blue-500/20",
                iconColor: "text-blue-600 bg-blue-50"
              },
              { 
                title: t("eco_ambassador_title"), 
                desc: t("eco_ambassador_desc"), 
                cta: t("eco_ambassador_cta"), 
                href: "/signup", 
                icon: Share2, 
                color: "from-indigo-500 to-purple-600 shadow-indigo-500/20",
                iconColor: "text-indigo-600 bg-indigo-50"
              },
              { 
                title: t("eco_donor_title"), 
                desc: t("eco_donor_desc"), 
                cta: t("eco_donor_cta"), 
                href: "/signup", 
                icon: Sparkles, 
                color: "from-amber-400 to-orange-500 shadow-amber-500/20",
                iconColor: "text-amber-600 bg-amber-50"
              },
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col h-full hover:border-transparent hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] transition-all duration-500">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${item.iconColor}`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-grow">{item.desc}</p>
                <Link 
                  href={item.href}
                  className={`inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r ${item.color} shadow-lg transition-all duration-300 hover:-translate-y-1 hover:brightness-110`}
                >
                  {item.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURATED SELECTIONS ──────────────────────────────────── */}
      {featuredCampaigns && featuredCampaigns.length > 0 && (
        <section className="py-20 px-4 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22c55e 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-black tracking-widest uppercase text-green-700 bg-green-100 rounded-full border border-green-200">
                <Trophy className="h-3 w-3" /> {t("editors_choice")}
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">{t("curated_selections")}</h2>
              <p className="text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                {t("curated_desc")}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {featuredCampaigns[0] && (
                <Link href={`/campaigns/${featuredCampaigns[0].id}`} className="group relative flex flex-col h-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl shadow-green-900/10 transition-transform duration-500 hover:-translate-y-2 lg:col-span-1">
                  <div className="relative h-96 w-full">
                    <img src={featuredCampaigns[0].hero_image_url} alt="" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                    <div className="absolute top-6 left-6 flex gap-2">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{t("most_urgent")}</span>
                      {(featuredCampaigns[0].organizations as any)?.registration_80g && (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Zap className="h-3 w-3" /> {t("tax_benefit")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-8 mt-auto relative z-10">
                    <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">{(featuredCampaigns[0].organizations as any)?.name}</p>
                    <h3 className="text-3xl font-black text-white mb-4 leading-tight">{featuredCampaigns[0].title}</h3>
                    <p className="text-gray-400 text-sm mb-8 line-clamp-2">{featuredCampaigns[0].story}</p>
                    <div className="flex items-center justify-between group/btn">
                      <div className="text-white text-lg font-black">
                        ₹{Number(featuredCampaigns[0].raised_amount).toLocaleString()} <span className="text-gray-500 text-sm font-normal">{t("raised")}</span>
                      </div>
                      <span className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold text-sm transition-all group-hover/btn:bg-green-400 group-hover/btn:text-white flex items-center gap-2">
                        {t("give_now")} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              <div className="flex flex-col gap-6 lg:col-span-1">
                {featuredCampaigns.slice(1, 4).map((c: any) => (
                  <Link key={c.id} href={`/campaigns/${c.id}`} className="flex flex-col sm:flex-row bg-white border border-gray-100 p-4 rounded-2xl gap-5 group hover:border-green-300 hover:shadow-xl hover:shadow-green-500/5 transition-all">
                    <div className="w-full sm:w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                      <img src={c.hero_image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center py-2">
                      <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1.5">{c.organizations?.name}</p>
                      <h4 className="font-black text-gray-900 mb-2 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">{c.title}</h4>
                      <div className="flex items-center gap-4 mt-auto">
                        <div className="text-sm font-black text-slate-900">₹{Number(c.raised_amount).toLocaleString()}</div>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">{t("fast_track")} <TrendingUp className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
                {featuredCampaigns.length < 3 && (
                  <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-dashed border-green-200">
                    <HeartPulse className="h-10 w-10 text-green-300 mb-3" />
                    <p className="text-sm font-bold text-green-800">{t("coming_soon")}</p>
                    <p className="text-xs text-green-600 mt-1">{t("verifying_desc")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-green-600 mb-3">{t("simple_design")}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{t("how_it_works")}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { step: "01", icon: ShieldCheck, titleKey: "ngo_verified", descKey: "ngo_verified_desc" },
              { step: "02", icon: QrCode, titleKey: "pay_upi", descKey: "pay_upi_desc" },
              { step: "03", icon: HeartPulse, titleKey: "track_impact", descKey: "track_impact_desc" },
            ].map(item => (
              <div key={item.step} className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300">
                <div className="text-xs font-black tracking-widest text-green-500 mb-4">{item.step}</div>
                <item.icon className="h-8 w-8 text-green-600 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(item.titleKey)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTIVE CAMPAIGNS ──────────────────────────────────────── */}
      <section id="campaigns" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-green-600 mb-2">{t("live_right_now")}</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{t("active_campaigns")}</h2>
              <p className="text-gray-500 mt-2">{t("active_campaigns_desc")}</p>
            </div>
            <Link href="/leaderboard" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full transition-colors">
              <Trophy className="h-4 w-4" /> {t("view_leaderboard")}
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {campaigns?.map((campaign: any) => {
              const raised = campaign.raised_amount || 0
              const goal = campaign.public_goal || 1
              const progress = Math.min((raised / goal) * 100, 100)
              const progressColor = progress >= 75 ? "bg-green-500" : progress >= 40 ? "bg-yellow-500" : "bg-blue-500"

              return (
                <div key={campaign.id} className="group relative">
                  <Card className="h-full overflow-hidden border-gray-100 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 rounded-2xl flex flex-col">
                    <Link href={`/campaigns/${campaign.id}`} className="absolute inset-0 z-10" aria-label={`View ${campaign.title}`} />
                    <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                      <img src={campaign.hero_image_url} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 px-0.5">
                        {campaign.organizations?.is_verified && (
                          <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-black text-green-700 flex items-center gap-1 shadow-sm uppercase tracking-tighter">
                            <ShieldCheck className="h-2.5 w-2.5" /> {t("verified")}
                          </div>
                        )}
                        {campaign.organizations?.registration_80g && (
                          <div className="bg-blue-600/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-black text-white flex items-center gap-1 shadow-sm uppercase tracking-tighter">
                            <Zap className="h-2.5 w-2.5 fill-current" /> {t("tax_benefit")}
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-5 flex flex-col flex-grow">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                        {campaign.organizations?.name}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
                        {campaign.title}
                      </h3>
                      {campaign.story && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                          {campaign.story}
                        </p>
                      )}

                      <div className="mt-auto">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-gray-900">₹{raised.toLocaleString('en-IN')}</span>
                          <span className="text-gray-400 font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${progressColor} rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs text-gray-400 mt-1.5">{t("of_goal").replace("of goal", `of ₹${goal.toLocaleString('en-IN')} ${t("of_goal")}`)}</div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Users className="h-3 w-3" /> {t("donate_upi")}
                          </span>
                          <span className="text-xs font-bold text-green-700 group-hover:gap-2 flex items-center gap-1 transition-all">
                            {t("give_now")} <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 relative z-20">
                          <ShareButton
                            campaignId={campaign.id}
                            campaignTitle={campaign.title}
                            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-bold"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}

            {(!campaigns || campaigns.length === 0) && (
              <div className="col-span-full py-24 text-center text-gray-400">
                <HeartPulse className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                <p className="font-semibold">{t("no_campaigns")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── AMBASSADOR PROGRAM ─────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#818cf8 0.5px, transparent 0.5px)', backgroundSize: '26px 26px' }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 text-[10px] font-black tracking-widest uppercase text-indigo-300 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                <Share2 className="h-3 w-3" /> Impact Ambassador Program
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5">Share a Link. <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Change a Life.</span></h2>
              <p className="text-indigo-200 text-base leading-relaxed mb-8">Become a PhilanthroForge Impact Ambassador — share tracked links to campaigns and watch your personal network drive real, measurable change across India.</p>
              <div className="space-y-4 mb-10">
                {[
                  { icon: Globe2, text: "Every click on your unique link is tracked and attributed to you" },
                  { icon: CheckCircle2, text: "One-click upgrade — no forms, no waiting" },
                  { icon: Star, text: "AI-generated captions make sharing effortless" },
                  { icon: Users, text: "See how many people donated because of your share" },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-indigo-200 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-4 rounded-xl text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
              >
                Become an Ambassador <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            {/* Right: impact collage */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/40">
              <img
                src="/ngo_impact_collage.png"
                alt="NGO Impact across India"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-indigo-700 text-[11px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">
                  <HeartPulse className="h-3 w-3" /> Real Impact
                </span>
                <span className="flex items-center gap-1.5 bg-indigo-500 text-white text-[11px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">
                  <Users className="h-3 w-3" /> Grassroots Driven
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ──────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-black tracking-widest uppercase text-gray-400 mb-10">Trusted, Transparent Giving</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: ShieldCheck, color: "text-teal-600 bg-teal-50 border-teal-100", title: "PF Verified", desc: "Every NGO manually verified by our trust team before going live." },
              { icon: Landmark, color: "text-purple-600 bg-purple-50 border-purple-100", title: "12A Registered", desc: "Legal exemption status confirmed for all partner organizations." },
              { icon: Zap, color: "text-blue-600 bg-blue-50 border-blue-100", title: "80G Tax Benefit", desc: "Claim income tax deductions on every donation you make." },
              { icon: PhoneCall, color: "text-green-600 bg-green-50 border-green-100", title: "Donor Support", desc: "Our team is available to assist with any donation queries." },
            ].map(badge => (
              <div key={badge.title} className={`flex flex-col items-center text-center p-6 rounded-2xl border ${badge.color} hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
                <badge.icon className="h-8 w-8 mb-3" />
                <h4 className="font-black text-gray-900 text-sm mb-1">{badge.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP / CTA ──────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">{t("raise_funds_heading")}</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">{t("raise_funds_desc")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]"
            >
              {t("apply_ngo")} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-4 rounded-xl text-sm border border-white/20 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
            >
              NGO Dashboard →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
