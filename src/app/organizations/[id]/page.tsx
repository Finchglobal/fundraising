import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ShieldCheck, Building2, FileCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"

export default async function NGOProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  // Ensure params.id is resolved for Next.js 15
  const paramData = await params
  const { id } = paramData

  const { data: org, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !org) {
    return notFound()
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  }

  // Fetch active and completed campaigns for this NGO
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, hero_image_url, public_goal, raised_amount, status")
    .eq("organization_id", id)
    .order("created_at", { ascending: false })

  const activeCampaigns = campaigns?.filter(c => c.status === 'published') || []
  const completedCampaigns = campaigns?.filter(c => c.status === 'completed') || []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />

      {/* NGO Banner & Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="h-32 w-32 bg-white rounded-full p-2 flex-shrink-0 shadow-lg">
              <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-center md:text-left text-white mt-4 md:mt-0 flex-1">
              <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{org.name}</h1>
                {org.is_verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30">
                    <ShieldCheck className="h-4 w-4" /> 100% Verified
                  </span>
                )}
              </div>
              <p className="text-lg text-slate-300 max-w-3xl leading-relaxed mb-6">
                {org.description}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <FileCheck className="h-4 w-4" />
                  <span>Reg: {org.registration_number}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>PAN: {org.pan_number?.replace(/.(?=.{4})/g, '*')}</span>
                </div>
                {/* 80G badge placeholder based on NSRCEL requirement */}
                <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">
                  <span>80G Eligible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">
        
        {org.youtube_url && getEmbedUrl(org.youtube_url) && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Impact in Action</h2>
            <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-200">
              <iframe 
                src={getEmbedUrl(org.youtube_url)!} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                className="w-full h-full min-h-[300px] md:min-h-[500px] aspect-video"
              />
            </div>
          </div>
        )}

        <div className="mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">Active Campaigns</h2>
        </div>
        
        {activeCampaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {activeCampaigns.map((campaign: any) => {
              const progress = Math.min(((campaign.raised_amount || 0) / campaign.public_goal) * 100, 100);
              
              return (
                <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="group flex flex-col h-full">
                  <Card className="h-full overflow-hidden border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img 
                        src={campaign.hero_image_url} 
                        alt={campaign.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2">
                        {campaign.title}
                      </h3>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between text-sm mb-2 text-slate-600">
                          <span className="font-semibold text-slate-900">₹{(campaign.raised_amount || 0).toLocaleString('en-IN')} raised</span>
                          <span>of ₹{(campaign.public_goal || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-slate-500 py-12 text-center bg-white rounded-xl border border-slate-200 mb-16">
            <p>This organization has no active campaigns at the moment.</p>
          </div>
        )}

        {completedCampaigns.length > 0 && (
          <>
            <div className="mb-8 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900">Past Impact</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedCampaigns.map((campaign: any) => (
                <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="group">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 opacity-80 hover:opacity-100 flex items-center gap-4 transition-all">
                     <img src={campaign.hero_image_url} className="w-16 h-16 rounded-lg object-cover" />
                     <div>
                       <h4 className="font-bold text-slate-900 line-clamp-1">{campaign.title}</h4>
                       <span className="text-sm text-teal-700 font-medium tracking-wide pb-1 block">Successfully Funded</span>
                       <span className="text-xs text-slate-500">₹{campaign.raised_amount?.toLocaleString('en-IN')} Raised</span>
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
