"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageCircle, Camera, FileText, Loader2, Copy, Check } from "lucide-react"

export default function AIShareStudio() {
  const supabase = createClient()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<{whatsapp: string, instagram: string, script: string} | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampaigns() {
      // In production, RLS scopes this to the logged-in NGO
      const { data } = await supabase.from("campaigns").select("id, title, story, public_goal").eq("status", "published")
      if (data) {
        setCampaigns(data)
      }
    }
    fetchCampaigns()
  }, [])

  const handleGenerate = async (campaign: any) => {
    setSelectedCampaign(campaign)
    setGenerating(true)
    setResults(null)

    // MVP AI Simulation: In a real app, this hits /api/generate passing the campaign.story
    // We simulate a 2-second Gemini generation response here for the NSRCEL pitch.
    setTimeout(() => {
      const generated = {
        whatsapp: `🚨 *Urgent Help Needed!* 🚨\n\n${campaign.title}\n\nWe are aiming to raise ₹${campaign.public_goal.toLocaleString('en-IN')} to support this cause. Every rupee matters, and your contribution can save a life.\n\n✅ 100% Verified Cause\n✅ Direct Bank UPI Transfer (Zero Fees)\n\nTap here to read the story and donate securely via Philanthroforge:\nhttps://philanthroforge.org/campaigns/${campaign.id}\n\nPlease share this with 3 friends! 🙏`,
        
        instagram: `Your support means the world to us. ❤️\n\n${campaign.title}\nWe are currently raising funds for this urgent cause. Help us reach our goal of ₹${campaign.public_goal.toLocaleString('en-IN')}.\n\nWhy donate here?\n🛡️ 100% verified NGO\n💸 Zero gateway fees (pure UPI)\n\nLink in bio to donate instantly using any UPI app! #Philanthroforge #Donate #SocialImpact #IndiaGives #Charity`,
        
        script: `[Video Hook – 3 seconds]\n"Have you ever wondered what happens when an entire community comes together?"\n\n[Body – 15 seconds]\n"Right now, we are raising ₹${campaign.public_goal.toLocaleString('en-IN')} for: ${campaign.title}. The situation is critical, but the solution is in your hands. Thanks to Philanthroforge, there are no platform fees. 100% of your UPI donation reaches the verified cause."\n\n[Call to Action – 5 seconds]\n"Scan the QR code on screen or click the link below to donate instantly. Let's make an impact today!"`
      }
      setResults(generated)
      setGenerating(false)
    }, 2500)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-teal-500" /> AI Share Studio
          </h1>
          <p className="text-slate-600">Powered by Google Gemini. Instantly generate optimized WhatsApp broadcasts, social captions, and video scripts to maximize your fundraising reach.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 border-r border-slate-200 pr-0 lg:pr-8">
            <h2 className="font-bold text-lg mb-4">1. Select Campaign</h2>
            <div className="space-y-3">
               {campaigns.map(c => (
                  <Card 
                    key={c.id} 
                    className={`cursor-pointer transition-all hover:border-teal-400 ${selectedCampaign?.id === c.id ? 'border-teal-500 ring-1 ring-teal-500 bg-teal-50/30' : 'border-slate-200'}`}
                    onClick={() => handleGenerate(c)}
                  >
                     <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm">{c.title}</h3>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Goal: ₹{c.public_goal.toLocaleString('en-IN')}</p>
                     </CardContent>
                  </Card>
               ))}
               {campaigns.length === 0 && (
                 <p className="text-sm text-slate-500 text-center py-8">No active campaigns available.</p>
               )}
            </div>
         </div>

         <div className="lg:col-span-2">
            <h2 className="font-bold text-lg mb-4">2. Generated Assets</h2>
            
            {!selectedCampaign && !generating && !results && (
              <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center flex-col text-slate-400">
                 <Sparkles className="h-10 w-10 mb-2 opacity-50" />
                 <p>Select a campaign to generate magical copy.</p>
              </div>
            )}

            {generating && (
              <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center flex-col text-teal-600 border border-slate-100">
                 <Loader2 className="h-10 w-10 mb-4 animate-spin" />
                 <p className="font-medium animate-pulse">Gemini is analyzing your campaign story...</p>
                 <p className="text-xs text-slate-500 mt-2">Crafting emotional appeals and CTAs</p>
              </div>
            )}

            {results && !generating && (
              <div className="space-y-6">
                {/* WhatsApp */}
                <Card className="border-green-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                  <CardHeader className="bg-slate-50/50 pb-3 flex flex-row items-center justify-between">
                     <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                       <MessageCircle className="h-5 w-5 text-green-600" /> WhatsApp Broadcast
                     </CardTitle>
                     <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.whatsapp, 'wa')}>
                       {copied === 'wa' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                     </Button>
                  </CardHeader>
                  <CardContent className="pt-4">
                     <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">{results.whatsapp}</p>
                  </CardContent>
                </Card>

                {/* Instagram */}
                <Card className="border-pink-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500" />
                  <CardHeader className="bg-slate-50/50 pb-3 flex flex-row items-center justify-between">
                     <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                       <Camera className="h-5 w-5 text-pink-600" /> Instagram Caption
                     </CardTitle>
                     <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.instagram, 'ig')}>
                       {copied === 'ig' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                     </Button>
                  </CardHeader>
                  <CardContent className="pt-4">
                     <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">{results.instagram}</p>
                  </CardContent>
                </Card>

                {/* Video Script */}
                <Card className="border-blue-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <CardHeader className="bg-slate-50/50 pb-3 flex flex-row items-center justify-between">
                     <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                       <FileText className="h-5 w-5 text-blue-600" /> Reel / Short Script
                     </CardTitle>
                     <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.script, 'script')}>
                       {copied === 'script' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                     </Button>
                  </CardHeader>
                  <CardContent className="pt-4">
                     <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans font-medium">{results.script}</p>
                  </CardContent>
                </Card>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}
