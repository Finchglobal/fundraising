import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ShieldCheck, CheckCircle2, Activity, Zap, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import DonationCaptureForm from "@/components/DonationCaptureForm"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import CopyUpiButton from "@/components/CopyUpiButton"
import { ShareButton } from "@/components/ui/ShareButton"
import { TranslatedText } from "@/components/TranslatedText"
import Link from "next/link"

export default async function CampaignPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ ref?: string }> }) {
  const supabase = await createClient()

  // Ensure params.id is resolved for Next.js 15
  const paramData = await params
  const { id } = paramData
  const queryParams = await searchParams
  const ref = queryParams?.ref
  let referrerId = null;

  if (ref) {
    const { data: refData } = await supabase.from('profiles').select('id').eq('ambassador_username', ref).single();
    if (refData) referrerId = refData.id;
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(`
      *,
      organizations (
        id,
        name,
        description,
        is_verified,
        upi_id,
        logo_url,
        registration_80g,
        registration_12a
      )
    `)
    .eq("id", id)
    .single()

  if (error || !campaign) return notFound()

  // Ensure unverified campaigns are only visible to their NGO or an Admin. 
  // For MVP, if it is not published, we check if the user is the owner.
  if (campaign.status !== 'published') {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return notFound()
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', session.user.id)
      .single()
      
    if (profile?.organization_id !== campaign.organization_id) {
      return notFound()
    }
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube (Standard & Shorts)
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const ytMatch = url.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}`;
    }

    // Instagram (Reels & Posts)
    const igRegExp = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/i;
    const igMatch = url.match(igRegExp);
    if (igMatch && igMatch[1]) {
      return `https://www.instagram.com/p/${igMatch[1]}/embed`;
    }

    return url; // Fallback to raw URL
  }

  const { data: donations } = await supabase
    .from("donations")
    .select("donor_name, amount, is_anonymous, created_at, status")
    .eq("campaign_id", id)
    .eq("status", "verified")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: updates } = await supabase
    .from("impact_updates")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false })

  const raised = campaign.raised_amount || 0
  const goal = campaign.public_goal || 0
  const progress = Math.min((raised / goal) * 100, 100)

  // Demo QR Code using quickchart.io for the UPI ID — properly URL-encoded
  const upiId = campaign.organizations?.upi_id || "demo@upi"
  const upiDeeplink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(campaign.organizations?.name || "")}&cu=INR`
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiDeeplink)}&size=300&margin=2`

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
        <Link href={`/organizations/${(campaign.organizations as any)?.id}`} className="group flex items-center gap-4 -mt-16 relative z-10 mb-8 w-fit">
          <img src={campaign.organizations?.logo_url} className="h-20 w-20 rounded-full border-4 border-white shadow-md bg-white object-cover group-hover:scale-105 transition-transform" alt="NGO Logo"/>
          <div className="pt-8">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{campaign.organizations?.name}</h2>
              {campaign.organizations?.is_verified && (
                <ShieldCheck className="h-5 w-5 text-teal-600" />
              )}
            </div>
            <p className="text-sm text-slate-500">Organizing this campaign · View Profile</p>
          </div>
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Left Column: Story & Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-8 break-words [overflow-wrap:anywhere]">
              {campaign.title}
            </h1>
            
            <div className="prose prose-slate prose-lg max-w-none text-slate-700 mb-10">
              <p className="whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">{campaign.story}</p>
            </div>

            {/* Embedded Campaign Video */}
            {campaign.video_url && getEmbedUrl(campaign.video_url) ? (
              <div className="mb-8">
                <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-slate-900 border border-slate-200">
                  <iframe 
                    src={getEmbedUrl(campaign.video_url)! + "&rel=0&showinfo=0&modestbranding=1"} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                    className="w-full h-full min-h-[300px] md:min-h-[450px] aspect-video"
                  />
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <ShareButton 
                    campaignId={campaign.id}
                    campaignTitle={campaign.title}
                    className="w-full py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-lg font-bold shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-8">
                <ShareButton 
                  campaignId={campaign.id}
                  campaignTitle={campaign.title}
                  className="w-full py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-lg font-bold shadow-sm"
                />
              </div>
            )}

            {/* Categorized Media Gallery */}
            {campaign.media_gallery && Array.isArray(campaign.media_gallery) && campaign.media_gallery.length > 0 && (
              <div className="mb-14 space-y-10">
                {/* Images */}
                {campaign.media_gallery.filter((m: any) => m.type === 'image').length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Photo Gallery</h3>
                    <div className="flex overflow-x-auto snap-x gap-4 pb-4 scrollbar-hide py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                      {campaign.media_gallery.filter((m: any) => m.type === 'image').map((media: any) => (
                        <div key={media.id} className="snap-center shrink-0 w-72 sm:w-80 h-56 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 hover:shadow-md transition-shadow">
                          <img src={media.url} alt="Campaign Media" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Standard Horizontal Videos */}
                {campaign.media_gallery.filter((m: any) => m.type === 'video' && m.url !== campaign.video_url).length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Featured Videos</h3>
                    <div className="flex overflow-x-auto snap-x gap-4 pb-4 scrollbar-hide py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                      {campaign.media_gallery.filter((m: any) => m.type === 'video' && m.url !== campaign.video_url).map((media: any) => (
                        <div key={media.id} className="snap-center shrink-0 w-80 sm:w-96 md:w-[450px] aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-900 hover:shadow-md transition-shadow">
                          <iframe 
                            src={getEmbedUrl(media.url)!}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen 
                            className="w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shorts & Reels */}
                {campaign.media_gallery.filter((m: any) => ['short', 'reel'].includes(m.type) && m.url !== campaign.video_url).length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Shorts & Reels</h3>
                    <div className="flex overflow-x-auto snap-x gap-4 pb-4 scrollbar-hide py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                      {campaign.media_gallery.filter((m: any) => ['short', 'reel'].includes(m.type) && m.url !== campaign.video_url).map((media: any, idx: number) => {
                        const isYT = media.url.includes("youtube.com") || media.url.includes("youtu.be") || media.embed_url?.includes("youtube")
                        const iframeUrl = isYT ? `${getEmbedUrl(media.url)}&rel=0&showinfo=0&modestbranding=1` : getEmbedUrl(media.url)

                        return (
                          <div key={idx} className="w-[140px] md:w-[220px] aspect-[9/16] shrink-0 snap-start bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                            <iframe
                              src={iframeUrl!}
                              className="w-full h-full object-cover"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )
                      })}
                    </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Native Share Actions Below Media */}
            <div className="flex items-center gap-3 mt-8 border-t border-slate-100 pt-6">
              <ShareButton 
                campaignId={campaign.id}
                campaignTitle={campaign.title}
                className="w-full py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-lg font-bold shadow-sm"
              />
            </div>

            {/* NGO Trust Card — links to public profile */}
            <Link href={`/organizations/${(campaign.organizations as any)?.id}`} className="block mt-12 p-5 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={(campaign.organizations as any)?.logo_url} alt="NGO" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-sm">{(campaign.organizations as any)?.name}</h3>
                      {(campaign.organizations as any)?.is_verified && <ShieldCheck className="h-4 w-4 text-teal-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Verified organization · View full profile →</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">View Profile →</span>
              </div>
            </Link>

            {/* Impact Timeline */}
            {updates && updates.length > 0 && (
              <div className="mt-12">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" /> Impact Timeline
                </h3>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {updates.map((update: any) => (
                    <div key={update.id} className="relative flex items-start gap-6 group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-green-500 text-green-600 z-10 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <div className="w-2 h-2 bg-current rounded-full" />
                      </div>
                      <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs font-bold text-slate-400 mb-1">
                          {new Date(update.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <p className="text-slate-800 leading-relaxed">{update.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          <div className="w-full lg:w-[400px] xl:w-[420px] shrink-0 min-w-[320px] relative">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
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

                {campaign.organizations?.registration_80g && (
                  <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <Zap className="h-5 w-5 text-blue-600 fill-blue-100" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-blue-800 uppercase tracking-tight">Tax Deduction Available</div>
                        <div className="text-[10px] text-blue-600 font-bold leading-tight">Claim 50% deduction under Section 80G</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center mb-6">
                  <div className="bg-white p-3 inline-block rounded-xl shadow-sm mb-4 border border-slate-100">
                    <img src={qrUrl} alt="UPI QR Code" className="w-40 h-40 object-contain mx-auto" />
                  </div>
                  <p className="font-bold text-slate-800 mb-1">Scan to Pay via Any UPI App</p>
                  <p className="text-xs text-slate-500 mb-3 break-all font-mono bg-slate-100 p-2 rounded border border-slate-200">
                    {upiId}
                  </p>
                  <CopyUpiButton upiId={upiId} />
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    <TranslatedText tKey="donate_upi" />
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    <TranslatedText tKey="scan_pay" />
                  </p>
                  <DonationCaptureForm campaignId={campaign.id} referrerId={referrerId} />
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-bold text-slate-900">₹{raised.toLocaleString('en-IN')} raised</span>
          <span className="text-sm text-slate-400">of ₹{goal.toLocaleString('en-IN')}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-2">
          <CopyUpiButton upiId={upiId} compact />
          <DonationCaptureForm campaignId={campaign.id} triggerClassName="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm flex items-center justify-center gap-2" />
        </div>
      </div>
    </div>
  )
}
