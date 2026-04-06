"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, RefreshCw, Receipt } from "lucide-react"

export default function UTRVerificationPage() {
  const supabase = createClient()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPendingDonations = async () => {
    setLoading(true)
    
    // MVP Fallback: Grabbing all pending for Demo if Auth isn't strict. 
    // In production, RLS handles this using org_id linked to the user's active session.
    const { data: user } = await supabase.auth.getUser()
    let query = supabase.from("donations").select("*, campaigns(title)").eq("status", "pending").order("created_at", { ascending: false })
    
    const { data } = await query
    
    if (data) {
      setDonations(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPendingDonations()
  }, [])

  const handleVerify = async (id: string, amount: number, campaignId: string) => {
    setActionLoading(id)
    
    // 1. Update Donation Status
    const { error } = await supabase.from("donations").update({ status: "verified" }).eq("id", id)
    
    if (!error) {
      // 2. Fetch current campaign raised amount safely using an RPC or double query (MVP: double query)
      const { data: campaign } = await supabase.from("campaigns").select("raised_amount").eq("id", campaignId).single()
      if (campaign) {
         await supabase.from("campaigns").update({ raised_amount: (campaign.raised_amount || 0) + amount }).eq("id", campaignId)
      }
      
      // Remove from list visually
      setDonations(prev => prev.filter(d => d.id !== id))
    }
    
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)
    await supabase.from("donations").update({ status: "rejected" }).eq("id", id)
    setDonations(prev => prev.filter(d => d.id !== id))
    setActionLoading(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">UTR Verification Queue</h1>
          <p className="text-slate-600">Cross-reference these donor claims with your bank statement before approving.</p>
        </div>
        <Button variant="outline" onClick={fetchPendingDonations} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Pending Bank Transfers</CardTitle>
          <CardDescription>Only approve matching UTRs. Approved donations generate a receipt and update campaign progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 font-semibold">Donor Details</th>
                  <th className="px-6 py-4 font-semibold">Campaign</th>
                  <th className="px-6 py-4 font-semibold">Claimed Amount</th>
                  <th className="px-6 py-4 font-semibold text-center">UTR Number</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && donations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Loading pending verifications...
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No pending UTRs! Your queue is clear.
                    </td>
                  </tr>
                ) : (
                  donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(donation.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{donation.donor_name} {donation.is_anonymous && "(Anon)"}</div>
                        <div className="text-slate-500 text-xs">{donation.donor_email || "No email provided"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-[200px] text-slate-700" title={donation.campaigns?.title}>
                          {donation.campaigns?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">₹{donation.amount.toLocaleString('en-IN')}</span>
                        {donation.platform_tip > 0 && <div className="text-xs text-slate-400">+ ₹{donation.platform_tip} Tip</div>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <code className="px-2 py-1 bg-slate-100 text-slate-800 rounded font-mono text-xs border border-slate-200 shadow-sm inline-block tracking-wider">
                          {donation.upi_utr}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                            disabled={actionLoading === donation.id}
                            onClick={() => handleVerify(donation.id, donation.amount, donation.campaign_id)}
                          >
                            {actionLoading === donation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                            Verify
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                            disabled={actionLoading === donation.id}
                            onClick={() => handleReject(donation.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-sm text-slate-500 bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
        <Receipt className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <div>
          <strong className="text-amber-800 font-semibold block mb-1">Important Legal Note</strong>
          Verify receipts against your bank statement exactly. False approvals create compliance issues. Rejecting a UTR will email the donor asking for correction (in production).
        </div>
      </div>
    </div>
  )
}
