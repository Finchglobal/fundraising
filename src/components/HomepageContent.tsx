"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, QrCode, HeartPulse, ArrowRight, Trophy, Users, TrendingUp, Zap } from "lucide-react"
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
}

export function HomepageContent({ campaigns, featuredCampaigns }: HomepageContentProps) {
  const { t } = useLang()

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section id="hero" className="relative flex flex-col items-center justify-center px-4 py-28 sm:py-36 bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2670"
            alt="Fundraising Hero"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950" />
        </div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-semibold tracking-widest uppercase text-green-400 bg-green-500/10 rounded-full border border-green-500/20 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("hero_verified_tag")}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
            {t("real_impact")}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              {t("real_trust")}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {t("hero_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#campaigns"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5"
            >
              {t("donate_now")} <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg border border-white/20 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
            >
              {t("join_supporter")} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-gray-300 font-bold px-8 py-4 rounded-xl text-lg border border-white/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              {t("ngo_onboarding")}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-8 mt-16 pt-12 border-t border-white/10">
            {[
              { value: "₹32,500+", label: t("stat_raised_month") },
              { value: "100%", label: t("stat_verified_orgs") },
              { value: "0%", label: t("stat_gateway_fees") },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
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

      {/* ── TRUST STRIP ──────────────────────────────────────────── */}
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
