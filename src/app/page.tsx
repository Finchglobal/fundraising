import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, QrCode, ArrowRight, HeartPulse } from "lucide-react"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"

export default async function LandingPage() {
  const supabase = await createClient()
  
  // Fetch featured campaigns with inner joined org data
  // Due to RLS, it handles public reads for published campaigns 
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(`
      id,
      title,
      hero_image_url,
      public_goal,
      raised_amount,
      organization_id,
      organizations ( name, is_verified )
    `)
    .eq("status", "published")
    .limit(3)
    
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 sm:py-32 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2670"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
        
        <div className="z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium text-teal-100 bg-teal-900/50 rounded-full border border-teal-800">
            <ShieldCheck className="h-4 w-4" /> Trusted NGO Verification
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Trust-first digital <br className="hidden sm:block"/> fundraising for India.
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            100% verified non-profits. Zero upfront fees. Simple UPI-led donations. 
            Direct impact backed by enterprise-grade trust infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-full px-8 py-6 h-auto text-lg transition-all duration-300">
              Explore Campaigns <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-8 py-6 h-auto text-lg transition-all duration-300">
              Register NGO
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Philanthroforge?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Built for radical transparency, we connect generous donors strictly to verified institutions, eradicating fraud using UPI infrastructure.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition duration-300">
              <ShieldCheck className="h-10 w-10 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">100% Verified Org</h3>
              <p className="text-slate-600">Every campaign is hosted by registered Trusts and NGOs. We verify PAN, 80G, and bank structures.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition duration-300">
              <QrCode className="h-10 w-10 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Zero Gateway Fees</h3>
              <p className="text-slate-600">Built around India's UPI networks. Money travels directly from your bank to the cause's bank account.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition duration-300">
              <HeartPulse className="h-10 w-10 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Impact Reporting</h3>
              <p className="text-slate-600">Post-campaign receipts and automated updates directly from the NGO, bridging the communication gap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Active Needs</h2>
            <p className="text-slate-600">Support vetted causes that need your urgent attention.</p>
          </div>
          <Link href="/campaigns" className="text-teal-600 font-medium hover:underline hidden sm:block">
            View all campaigns →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns?.map((campaign: any) => {
            const progress = Math.min(((campaign.raised_amount || 0) / campaign.public_goal) * 100, 100);
            
            return (
              <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="group flex flex-col h-full">
                <Card className="h-full overflow-hidden border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative h-56 w-full overflow-hidden">
                    <img 
                      src={campaign.hero_image_url} 
                      alt={campaign.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {campaign.organizations?.is_verified && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-teal-700 flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                       {campaign.organizations?.name}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2">
                      {campaign.title}
                    </h3>
                    
                    <div className="mt-auto pt-4">
                      <div className="flex justify-between text-sm mb-2 text-slate-600">
                        <span className="font-semibold text-slate-900">₹{(campaign.raised_amount || 0).toLocaleString('en-IN')} raised</span>
                        <span>of ₹{(campaign.public_goal || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
          
          {(!campaigns || campaigns.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-500">
              No active campaigns at the moment. Please run the seed script!
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
