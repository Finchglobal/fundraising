import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, QrCode, HeartPulse, ArrowRight, Trophy, Users } from "lucide-react"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"

export default async function LandingPage() {
  const supabase = await createClient()
  
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
