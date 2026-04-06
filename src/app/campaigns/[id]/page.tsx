import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ShieldCheck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import DonationCaptureForm from "@/components/DonationCaptureForm"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Ensure params.id is resolved for Next.js 15
  const paramData = await params
  const { id } = paramData

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(`
      *,
      organizations (
        name,
        description,
        is_verified,
        upi_id,
        logo_url
      )
    `)
    .eq("id", id)
    .single()

  if (error || !campaign) {
    return notFound()
  }

  const { data: donations } = await supabase
    .from("donations")
    .select("donor_name, amount, is_anonymous, created_at, status")
    .eq("campaign_id", id)
    .eq("status", "verified")
    .order("created_at", { ascending: false })
    .limit(5)

  const raised = campaign.raised_amount || 0
  const goal = campaign.public_goal || 0
  const progress = Math.min((raised / goal) * 100, 100)

  // Demo QR Code using quickchart.io for the UPI ID
  const upiId = campaign.organizations?.upi_id || "demo@upi"
  const qrUrl = `https://quickchart.io/qr?text=upi://pay?pa=${upiId}&pn=${encodeURIComponent(campaign.organizations?.name)}&size=300`

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-0">
      <SiteNavbar />

      {/* Hero Banner Image */}
      <div className="w-full h-64 sm:h-96 relative bg-slate-900">
        <img src={campaign.hero_image_url} alt="Campaign Hero" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* NGO Info */}
        <div className="flex items-center gap-4 -mt-16 relative z-10 mb-8">
          <img src={campaign.organizations?.logo_url} className="h-20 w-20 rounded-full border-4 border-white shadow-md bg-white object-cover" alt="NGO Logo"/>
          <div className="pt-8">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{campaign.organizations?.name}</h2>
              {campaign.organizations?.is_verified && (
                <ShieldCheck className="h-5 w-5 text-teal-600" />
              )}
            </div>
            <p className="text-sm text-slate-500">Organizing this campaign</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Story & Details */}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-8">
              {campaign.title}
            </h1>
            
            <div className="prose prose-slate prose-lg max-w-none text-slate-700">
              <p className="whitespace-pre-wrap leading-relaxed">{campaign.story}</p>
            </div>

            {/* Proofs / Documents Placeholder */}
            <div className="mt-12 p-6 bg-white border border-slate-200 rounded-xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="text-teal-600 h-5 w-5" /> Verified Documentation
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                This NGO has provided medical estimates and beneficiary details to Philanthroforge. 
                Funds are deployed directly to the verified causes.
              </p>
              <Button variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50">
                View Proof Documents
              </Button>
            </div>

            {/* Recent Donations */}
            <div className="mt-12">
              <h3 className="font-bold text-xl mb-6">Recent Supporters</h3>
              <div className="space-y-4">
                {donations?.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
                        {d.is_anonymous ? "A" : d.donor_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{d.is_anonymous ? "Anonymous" : d.donor_name}</div>
                        <div className="text-xs text-slate-500">{new Date(d.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">
                      ₹{d.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
                {(!donations || donations.length === 0) && (
                  <p className="text-slate-500 text-sm">Be the first to donate to this cause!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Goal & Payment (Desktop) */}
          <div className="w-full lg:w-96 relative">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between text-slate-900 mb-2">
                  <span className="text-3xl font-extrabold tracking-tight">₹{raised.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-slate-500 font-medium">Goal: ₹{goal.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center mb-6">
                  <div className="bg-white p-3 inline-block rounded-xl shadow-sm mb-4 border border-slate-100">
                    <img src={qrUrl} alt="UPI QR Code" className="w-40 h-40 object-contain mx-auto" />
                  </div>
                  <p className="font-bold text-slate-800 mb-1">Scan to Pay via Any UPI App</p>
                  <p className="text-sm text-slate-500 mb-4 break-all font-mono bg-slate-200/50 p-2 rounded">
                    {upiId}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-center text-slate-600">
                     Already made the payment through your UPI app?
                  </p>
                  <DonationCaptureForm campaignId={campaign.id} />
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                <ShieldCheck className="h-4 w-4" /> Secure, Zero-Fee UPI Transfer
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between gap-4">
        <div className="flex flex-col flex-1">
          <span className="font-bold text-slate-900 text-lg">₹{raised.toLocaleString('en-IN')} raised</span>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <DonationCaptureForm campaignId={campaign.id} triggerClassName="bg-teal-600 hover:bg-teal-500 text-white font-bold py-6 px-6 rounded-xl shadow-md whitespace-nowrap" />
      </div>
    </div>
  )
}
