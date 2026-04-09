"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Send, PlayCircle, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function PitchSimulationTool({ orgId, campaigns }: { orgId: string, campaigns: any[] }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [updateContent, setUpdateContent] = useState("")
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || "")

  const simulateDonation = async () => {
    if (!selectedCampaignId) return
    setLoading(true)
    
    // Generate mock donation
    const donorNames = ["Anita Desai", "Vikram Seth", "Priya Sharma", "Rahul Kapoor", "Sneha Gupta"]
    const randomName = donorNames[Math.floor(Math.random() * donorNames.length)]
    const randomAmount = Math.floor(Math.random() * 5000) + 500
    const mockUtr = `SIM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    const { error } = await supabase.from("donations").insert({
      campaign_id: selectedCampaignId,
      donor_name: randomName,
      donor_email: `${randomName.toLowerCase().replace(" ", ".")}@example.com`,
      amount: randomAmount,
      upi_utr: mockUtr,
      status: "pending"
    })

    if (!error) {
      toast.success("Demo Success: Mock pending donation created!", {
        description: `Verify UTR ${mockUtr} in the Donations tab to see impact.`
      })
    }
    setLoading(false)
  }

  const postUpdate = async () => {
    if (!selectedCampaignId || !updateContent) return
    setLoading(true)

    const { error } = await supabase.from("impact_updates").insert({
      campaign_id: selectedCampaignId,
      content: updateContent
    })

    if (!error) {
      toast.success("Impact update posted!", {
        description: "Donors will see this on the live campaign timeline."
      })
      setUpdateContent("")
    }
    setLoading(false)
  }

  return (
    <Card className="border-teal-200 bg-teal-50/30 overflow-hidden shadow-sm">
      <CardHeader className="bg-teal-500/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-teal-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 fill-teal-500" /> Pitch Simulation Tool
          </CardTitle>
          <span className="text-[10px] font-bold bg-teal-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Demo Only</span>
        </div>
        <CardDescription className="text-teal-700/80">
          Use these tools to showcase live functionality during your presentation.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label className="text-slate-700 text-xs font-bold uppercase mb-2 block">1. Select Case Study</Label>
          <select 
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm"
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="border-teal-200 hover:bg-teal-100 flex flex-col h-auto py-3 gap-1"
            onClick={simulateDonation}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5 text-teal-600" />}
            <span className="text-xs font-bold">Simulate Donation</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="border-blue-200 hover:bg-blue-100 flex flex-col h-auto py-3 gap-1"
            onClick={() => window.open(`/campaigns/${selectedCampaignId}`, '_blank')}
          >
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-bold">View Public Page</span>
          </Button>
        </div>

        <div className="pt-4 border-t border-teal-100">
          <Label className="text-slate-700 text-xs font-bold uppercase mb-2 block">2. Post Impact Update</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. Surgery successfully completed!" 
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
              className="bg-white border-slate-200"
            />
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={postUpdate} disabled={loading || !updateContent}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Visible to donors on the Public Campaign Timeline.</p>
        </div>
      </CardContent>
    </Card>
  )
}
