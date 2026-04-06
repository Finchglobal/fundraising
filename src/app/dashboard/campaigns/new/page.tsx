"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2, Send, Save, IndianRupee } from "lucide-react"

export default function CampaignWizard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [story, setStory] = useState("")
  const [heroImage, setHeroImage] = useState("")
  const [actualNeed, setActualNeed] = useState<number | "">("")

  // Philanthroforge 2% SaaS buffer calculation
  const bufferAmount = actualNeed ? Math.round(actualNeed * 0.02) : 0
  const publicGoal = actualNeed ? actualNeed + bufferAmount : 0

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !story || !actualNeed) return
    
    setLoading(true)
    
    // MVP Fallback Org Handling - Fetch a default org if user not actively queried properly
    const { data: orgData } = await supabase.from("organizations").select("id").limit(1).single()
    
    const { error } = await supabase.from("campaigns").insert({
      organization_id: orgData?.id, // In production, grab strictly from active auth profile
      title,
      story,
      hero_image_url: heroImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
      actual_need: actualNeed,
      platform_buffer: bufferAmount,
      public_goal: publicGoal,
      status: "published",
      raised_amount: 0
    })

    setLoading(false)
    if (!error) {
      router.push("/dashboard")
      router.refresh()
    } else {
      alert("Error publishing campaign: " + error.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create New Campaign</h1>
        <p className="text-slate-600">Draft your fundraising appeal. Philanthroforge helps you factor in the operational buffer transparently.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="md:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePublish} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Support 8-year-old Aarav's Heart Surgery" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">The Story</Label>
                  <textarea 
                    id="story" 
                    className="flex min-h-[200px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe the beneficiary, the situation, and how the funds will be used..." 
                    value={story} 
                    onChange={e => setStory(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="heroImage">Cover Image URL (Optional)</Label>
                  <Input 
                    id="heroImage" 
                    placeholder="https://..." 
                    value={heroImage} 
                    onChange={e => setHeroImage(e.target.value)} 
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="button" variant="outline" className="flex-1" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" /> Save Draft
                  </Button>
                  <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-500 text-white" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Publish Campaign
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Pricing/Buffer Calculator */}
        <div className="md:col-span-1">
          <div className="sticky top-10 space-y-6">
             <Card className="border-teal-100 shadow-teal-100/50 shadow-md">
               <CardHeader className="bg-teal-50/50 border-b border-teal-50">
                 <CardTitle className="text-teal-900 text-lg flex items-center gap-2">
                   <IndianRupee className="h-5 w-5" /> Goal Calculator
                 </CardTitle>
               </CardHeader>
               <CardContent className="pt-6 space-y-6">
                 <div className="space-y-2">
                   <Label htmlFor="actualNeed" className="text-slate-700">Actual Beneficiary Need</Label>
                   <div className="relative">
                     <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                     <Input 
                       id="actualNeed" 
                       type="number" 
                       min="1000"
                       className="pl-8 text-lg font-semibold"
                       placeholder="1,00,000" 
                       value={actualNeed} 
                       onChange={e => setActualNeed(e.target.value ? Number(e.target.value) : "")} 
                       required 
                     />
                   </div>
                   <p className="text-xs text-slate-500">Exact amount needed for the cause.</p>
                 </div>

                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Beneficiary Need</span>
                      <span className="font-semibold text-slate-900">₹{Number(actualNeed).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 border-b border-slate-200 pb-3">
                      <span className="flex items-center gap-1 group relative cursor-help">
                         Platform Support (2%)
                      </span>
                      <span className="font-semibold text-slate-900">₹{bufferAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                       <span className="font-bold text-slate-900">Public Goal</span>
                       <span className="text-2xl font-extrabold text-teal-600">₹{publicGoal.toLocaleString('en-IN')}</span>
                    </div>
                 </div>

                 <div className="text-xs text-slate-500 bg-white border border-slate-200 p-3 rounded-lg leading-relaxed">
                   <strong>Transparent Billing:</strong> You will only be invoiced for the 2% support fee periodically based on successfully raised amounts. There are zero upfront costs.
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
