"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, RefreshCw, Receipt, Download } from "lucide-react"
import { generate80GReceipt, numToWords } from "@/lib/utils/generateReceipt"

export default function DonationsDashboardPage() {
  const supabase = createClient()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("pending")
  const [orgData, setOrgData] = useState<any>(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    
    // Get current user's organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = "/login"
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, organizations(*)")
      .eq("id", user.id)
      .single()

    let currentOrgId = profile?.organization_id
    if (profile?.organizations) setOrgData(profile.organizations)

    // Fallback for Demo
    if (!currentOrgId) {
      const { data: fallbackOrg } = await supabase.from("organizations").select("*").limit(1).single()
      if (fallbackOrg) {
        currentOrgId = fallbackOrg.id
        setOrgData(fallbackOrg)
      }
    }

    if (!currentOrgId) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("donations")
      .select("*, campaigns!inner(title, organization_id)")
      .eq("campaigns.organization_id", currentOrgId)
      .order("created_at", { ascending: false })
    
    if (data) {
      setDonations(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleVerify = async (id: string, amount: number, campaignId: string) => {
    setActionLoading(id)
    const { error } = await supabase.from("donations").update({ status: "verified" }).eq("id", id)
    
    if (!error) {
      const { data: campaign } = await supabase.from("campaigns").select("raised_amount").eq("id", campaignId).single()
      if (campaign) {
         await supabase.from("campaigns").update({ raised_amount: (campaign.raised_amount || 0) + amount }).eq("id", campaignId)
      }
      setDonations(prev => prev.map(d => d.id === id ? { ...d, status: "verified" } : d))
    }
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)
    await supabase.from("donations").update({ status: "rejected" }).eq("id", id)
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: "rejected" } : d))
    setActionLoading(null)
  }

  const handleDownloadReceipt = (donation: any) => {
    generate80GReceipt({
      receiptNumber: `PF-${new Date(donation.created_at).getFullYear()}-${donation.id.slice(0, 6).toUpperCase()}`,
      date: new Date(donation.created_at).toLocaleDateString("en-IN"),
      donorName: donation.donor_name,
      donorPan: donation.donor_pan || "Not Provided",
      donorEmail: donation.donor_email || "",
      amount: donation.amount,
      amountWords: numToWords(donation.amount),
      paymentMode: "UPI / Bank Transfer",
      utr: donation.upi_utr,
      campaignName: donation.campaigns?.title || "General Fund",
      ngoContext: {
        name: orgData?.name || "Verified NGO Partner",
        address: orgData?.address || "India",
        pan: orgData?.pan_number || "PENDING PAN",
        registration_detail: orgData?.registration_number || "PENDING REG"
      }
    })
  }

  const pendingList = donations.filter(d => d.status === "pending")
  const verifiedList = donations.filter(d => d.status === "verified")

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Donor Management</h1>
          <p className="text-slate-600">Verify UPI transactions and issue 80G tax receipts to your supporters.</p>
        </div>
        <Button variant="outline" onClick={fetchDashboardData} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'pending' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Pending Verifications ({pendingList.length})
        </button>
        <button 
          onClick={() => setActiveTab("verified")}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'verified' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Approved & Receipts
        </button>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>{activeTab === "pending" ? "Pending Bank Transfers" : "Verified Donations"}</CardTitle>
          <CardDescription>
            {activeTab === "pending" 
              ? "Cross-reference these claims with your bank statement before approving." 
              : "Generates an automated 80G PDF receipt using your NGO registration details."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Donor Details</th>
                  <th className="px-6 py-4 font-semibold">Campaign</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold text-center">UTR / Ref</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && donations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Loading data...
                    </td>
                  </tr>
                ) : (activeTab === "pending" && pendingList.length === 0) || (activeTab === "verified" && verifiedList.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No {activeTab} records found!
                    </td>
                  </tr>
                ) : (
                  (activeTab === "pending" ? pendingList : verifiedList).map((donation) => (
                    <tr key={donation.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{donation.donor_name} {donation.is_anonymous && "(Anon)"}</div>
                        <div className="text-slate-500 text-xs">{donation.donor_email || "No email"} | PAN: {donation.donor_pan || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-[200px] text-slate-700" title={donation.campaigns?.title}>
                          {donation.campaigns?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">₹{donation.amount.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <code className="px-2 py-1 bg-slate-100 text-slate-800 rounded font-mono text-xs border border-slate-200 flex items-center justify-center min-w-[120px]">
                          {donation.upi_utr}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === "pending" ? (
                            <>
                              <Button 
                                variant="outline" size="sm" 
                                className="bg-green-50 text-green-700 hover:bg-green-100"
                                disabled={actionLoading === donation.id}
                                onClick={() => handleVerify(donation.id, donation.amount, donation.campaign_id)}
                              >
                                {actionLoading === donation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />} Verify
                              </Button>
                              <Button 
                                variant="outline" size="sm" 
                                className="bg-red-50 text-red-700 hover:bg-red-100 px-2"
                                disabled={actionLoading === donation.id}
                                onClick={() => handleReject(donation.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" size="sm"
                              onClick={() => handleDownloadReceipt(donation)}
                              className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1" /> PDF Receipt
                            </Button>
                          )}
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
      
      {activeTab === "pending" && (
        <div className="mt-6 text-sm text-slate-500 bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
          <Receipt className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
             <strong className="text-amber-800 font-semibold block mb-1">Important Legal Note</strong>
             Verify receipts against your bank statement exactly. False approvals create compliance issues. Rejecting a UTR will email the donor asking for correction (in production).
          </div>
        </div>
      )}
    </div>
  )
}
