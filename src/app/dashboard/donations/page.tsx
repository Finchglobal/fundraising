"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, RefreshCw, Receipt, Download, Image as ImageIcon, ExternalLink } from "lucide-react"
import { generate80GReceipt, numToWords } from "@/lib/utils/generateReceipt"
import { useLang } from "@/components/LanguageSwitcher"

export default function DonationsDashboardPage() {
  const supabase = createClient()
  const { t } = useLang()
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
         await supabase.from("campaigns").update({ raised_amount: Number(campaign.raised_amount || 0) + Number(amount) }).eq("id", campaignId)
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
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t("mgmt_title")}</h1>
          <p className="text-slate-600 font-medium">{t("mgmt_desc")}</p>
        </div>
        <Button variant="outline" onClick={fetchDashboardData} disabled={loading} className="gap-2 font-bold bg-white text-slate-700 border-slate-200">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {t("mgmt_refresh")}
        </Button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'pending' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t("mgmt_tab_pending")} ({pendingList.length})
        </button>
        <button 
          onClick={() => setActiveTab("verified")}
          className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'verified' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t("mgmt_tab_verified")}
        </button>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-xl font-bold text-slate-900">{activeTab === "pending" ? t("mgmt_tab_pending") : t("mgmt_tab_verified")}</CardTitle>
          <CardDescription className="font-medium">
            {activeTab === "pending" 
              ? t("mgmt_pending_desc")
              : t("mgmt_verified_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-y border-slate-100 tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-black">{t("mgmt_table_date")}</th>
                  <th className="px-6 py-4 font-black">{t("mgmt_table_donor")}</th>
                  <th className="px-6 py-4 font-black">{t("mgmt_table_campaign")}</th>
                  <th className="px-6 py-4 font-black">{t("mgmt_table_amount")}</th>
                  <th className="px-6 py-4 font-black text-center">{t("mgmt_table_utr")}</th>
                  <th className="px-6 py-4 font-black text-right">{t("mgmt_table_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && donations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold animate-pulse">
                      {t("mgmt_loading")}
                    </td>
                  </tr>
                ) : (activeTab === "pending" && pendingList.length === 0) || (activeTab === "verified" && verifiedList.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      {t("mgmt_empty")}
                    </td>
                  </tr>
                ) : (
                  (activeTab === "pending" ? pendingList : verifiedList).map((donation) => (
                    <tr key={donation.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{donation.donor_name} {donation.is_anonymous && t("mgmt_anon")}</div>
                        <div className="text-slate-500 text-xs font-medium">{donation.donor_email || t("mgmt_no_email")} | PAN: {donation.donor_pan || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-[200px] text-slate-700 font-medium" title={donation.campaigns?.title}>
                          {donation.campaigns?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-900">₹{Number(donation.amount).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <code className="px-2 py-1 bg-slate-100 text-slate-800 rounded font-mono text-xs border border-slate-200 flex items-center justify-center min-w-[120px] font-bold">
                            {donation.upi_utr}
                          </code>
                          {donation.proof_url && (
                            <a 
                              href={donation.proof_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-1 rounded hover:bg-teal-100 transition-all uppercase tracking-wider"
                            >
                              <ImageIcon className="h-3 w-3" /> {t("mgmt_screenshot")}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === "pending" ? (
                            <>
                              <Button 
                                variant="outline" size="sm" 
                                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-100 font-bold"
                                disabled={actionLoading === donation.id}
                                onClick={() => handleVerify(donation.id, donation.amount, donation.campaign_id)}
                              >
                                {actionLoading === donation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />} {t("mgmt_verify")}
                              </Button>
                              <Button 
                                variant="outline" size="sm" 
                                className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100 px-2"
                                disabled={actionLoading === donation.id}
                                onClick={() => handleReject(donation.id)}
                              >
                                {actionLoading === donation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" size="sm"
                              onClick={() => handleDownloadReceipt(donation)}
                              className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-all font-bold"
                            >
                              <Download className="h-4 w-4 mr-1" /> {t("mgmt_receipt_pdf")}
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
        <div className="mt-6 text-sm text-slate-500 bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex gap-4 items-start shadow-sm">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
             <Receipt className="h-5 w-5" />
          </div>
          <div>
             <strong className="text-blue-900 font-bold block mb-1 text-base">{t("mgmt_legal_note_title")}</strong>
             <p className="font-medium text-blue-700/80 leading-relaxed">
               {t("mgmt_legal_note_desc")} {t("mgmt_rejection_email_note")}
             </p>
          </div>
        </div>
      )}
    </div>
  )
}
