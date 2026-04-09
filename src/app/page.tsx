import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, QrCode, HeartPulse, ArrowRight, Trophy, Users, TrendingUp } from "lucide-react"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { LiveActivityTicker } from "@/components/LiveActivityTicker"
import { PitchSimulationTool } from "@/components/PitchSimulationTool"

export default async function LandingPage() {
  const supabase = await createClient()
  
  const { data: featuredCampaigns } = await supabase
    .from("campaigns")
    .select(`
      id,
      title,
      hero_image_url,
      public_goal,
      raised_amount,
      story,
      organization_id,
      organizations ( name, is_verified )
    `)
    .eq("status", "published")
    .eq("is_featured", true)
    .limit(3)

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(`
      id,
      title,
      hero_image_url,
      public_goal,
      raised_amount,
      story,
      organization_id,
      organizations ( name, is_verified )
    `)
    .eq("status", "published")
    .eq("is_featured", false)
    .limit(6)
    
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <SiteNavbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section id="hero" className="relative flex flex-col items-center justify-center px-4 py-28 sm:py-36 bg-gray-950 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2670"
            alt="Fundraising Hero"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950" />
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-semibold tracking-widest uppercase text-green-400 bg-green-500/10 rounded-full border border-green-500/20 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified NGO Platform · Zero Gateway Fees
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
            Real Impact.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              Real Trust.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            India's first <strong className="text-white font-semibold">UPI-native</strong> fundraising platform. Every campaign is verified. Every rupee goes directly to the cause.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#campaigns"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5"
            >
              Donate Now <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg border border-white/20 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
            >
              Start a Fundraiser <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 mt-16 pt-12 border-t border-white/10">
            {[
              { value: "₹32,500+", label: "Raised this month" },
              { value: "100%", label: "Verified organisations" },
              { value: "0%", label: "Gateway fees" },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LiveActivityTicker />
      
      {/* Simulation Tool for Pitch Demo */}
      <section className="bg-slate-50 py-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <PitchSimulationTool 
            orgId={featuredCampaigns?.[0]?.organization_id || ""} 
            campaigns={featuredCampaigns || []} 
          />
        </div>
      </section>

      {/* ── CURATED SELECTIONS ───────────────────────────── */}
      {featuredCampaigns && featuredCampaigns.length > 0 && (
        <section className="py-20 px-4 bg-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22c55e 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-black tracking-widest uppercase text-green-700 bg-green-100 rounded-full border border-green-200">
                <Trophy className="h-3 w-3" /> Editor's Choice
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Curated Selections</h2>
              <p className="text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                Hand-picked campaigns that represent our most urgent needs and highest-impact community projects.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Primary Featured Card */}
              {featuredCampaigns[0] && (
                <Link href={`/campaigns/${featuredCampaigns[0].id}`} className="group relative flex flex-col h-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl shadow-green-900/10 transition-transform duration-500 hover:-translate-y-2 lg:col-span-1">
                  <div className="relative h-96 w-full">
                    <img 
                      src={featuredCampaigns[0].hero_image_url} 
                      alt="" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                    <div className="absolute top-6 left-6 flex gap-2">
                       <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Most Urgent</span>
                    </div>
                  </div>
                  <div className="p-8 mt-auto relative z-10">
                    <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">{(featuredCampaigns[0].organizations as any)?.name}</p>
                    <h3 className="text-3xl font-black text-white mb-4 leading-tight">{featuredCampaigns[0].title}</h3>
                    <p className="text-gray-400 text-sm mb-8 line-clamp-2">{featuredCampaigns[0].story}</p>
                    <div className="flex items-center justify-between group/btn">
                      <div className="text-white text-lg font-black">
                        ₹{Number(featuredCampaigns[0].raised_amount).toLocaleString()} <span className="text-gray-500 text-sm font-normal">raised</span>
                      </div>
                      <span className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold text-sm transition-all group-hover/btn:bg-green-400 group-hover/btn:text-white flex items-center gap-2">
                        Give Now <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Secondary Featured List */}
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
                         <span className="text-xs font-bold text-green-600 flex items-center gap-1">Fast Track <TrendingUp className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {/* Visual Filler if less than 3 featured */}
                {featuredCampaigns.length < 3 && (
                   <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-dashed border-green-200">
                      <HeartPulse className="h-10 w-10 text-green-300 mb-3" />
                      <p className="text-sm font-bold text-green-800">More curated causes coming soon</p>
                      <p className="text-xs text-green-600 mt-1">Our team is verifying more NGOs right now.</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-green-600 mb-3">Simple by design</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { step: "01", icon: ShieldCheck, title: "NGO Verified", desc: "Every organisation is vetted with PAN, 80G, and bank account verification before going live." },
              { step: "02", icon: QrCode, title: "Pay via UPI", desc: "Scan the QR code or use any UPI app. Zero payment gateway fee — every rupee reaches the cause." },
              { step: "03", icon: HeartPulse, title: "Track Impact", desc: "Receive post-campaign updates and UTR-verified donation receipts directly from the NGO." },
            ].map(item => (
              <div key={item.step} className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300">
                <div className="text-xs font-black tracking-widest text-green-500 mb-4">{item.step}</div>
                <item.icon className="h-8 w-8 text-green-600 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTIVE CAMPAIGNS ─────────────────────────────── */}
      <section id="campaigns" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-green-600 mb-2">Live right now</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Active Campaigns</h2>
              <p className="text-gray-500 mt-2">Every campaign below is live-verified. Your donation goes straight to the cause.</p>
            </div>
            <Link href="/leaderboard" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full transition-colors">
              <Trophy className="h-4 w-4" /> View Leaderboard
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {campaigns?.map((campaign: any) => {
              const raised = campaign.raised_amount || 0
              const goal = campaign.public_goal || 1
              const progress = Math.min((raised / goal) * 100, 100)
              const progressColor = progress >= 75 ? "bg-green-500" : progress >= 40 ? "bg-yellow-500" : "bg-blue-500"
              
              return (
                <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="group">
                  <Card className="h-full overflow-hidden border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 rounded-2xl">
                    <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                      <img 
                        src={campaign.hero_image_url} 
                        alt={campaign.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {campaign.organizations?.is_verified && (
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-green-700 flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </div>
                      )}
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
                          <div 
                            className={`h-full ${progressColor} rounded-full transition-all duration-1000`}
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1.5">of ₹{goal.toLocaleString('en-IN')} goal</div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Users className="h-3 w-3" /> Donate via UPI
                          </span>
                          <span className="text-xs font-bold text-green-700 group-hover:gap-2 flex items-center gap-1 transition-all">
                            Give now <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
            
            {(!campaigns || campaigns.length === 0) && (
              <div className="col-span-full py-24 text-center text-gray-400">
                <HeartPulse className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                <p className="font-semibold">No active campaigns yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">Want to raise funds for your NGO?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">PhilanthroForge onboards registered Indian NGOs and trusts with fully-verified, zero-fee fundraising infrastructure.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]"
            >
              Apply as an NGO Partner <ArrowRight className="h-5 w-5" />
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

      <SiteFooter />
    </main>
  )
}
