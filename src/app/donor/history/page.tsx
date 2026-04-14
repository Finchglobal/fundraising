"use client"

import { createClient } from "@/lib/supabase/client"
import { ShieldCheck, Clock, AlertCircle, IndianRupee, ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useLang } from "@/components/LanguageSwitcher"

export default function DonationHistoryPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const { data: donations } = await supabase
        .from("donations")
        .select("*, campaigns(title, organization_id, organizations(name))")
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false })
      
      setDonations(donations || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center p-4 font-bold text-slate-400 animate-pulse">Loading History...</div>
  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/donor" className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t("history_title")}</h1>
          <p className="text-gray-500 font-medium font-outfit">{t("history_desc")}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {donations && donations.length > 0 ? (
          <div className="overflow-x-auto text-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("history_date")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("history_cause")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t("history_amount")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("history_status")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t("history_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {donations.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(d.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        {new Date(d.created_at).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-900 mb-0.5">{d.campaigns?.title}</p>
                      <p className="text-xs text-gray-500 font-medium">via {d.campaigns?.organizations?.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">UTR: {d.upi_utr}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-lg font-black text-gray-900">₹{Number(d.amount).toLocaleString()}</p>
                      {Number(d.platform_tip) > 0 && (
                        <p className="text-[10px] text-gray-400 font-bold">+ ₹{d.platform_tip} Tip</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        d.status === 'verified' 
                          ? 'bg-green-100 text-green-700' 
                          : d.status === 'pending'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {d.status === 'verified' && <ShieldCheck className="h-3 w-3" />}
                        {d.status === 'pending' && <Clock className="h-3 w-3" />}
                        {d.status === 'rejected' && <AlertCircle className="h-3 w-3" />}
                        {d.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <Link 
                         href={`/campaigns/${d.campaign_id}`} 
                         className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-all"
                       >
                         <Heart className="h-3 w-3" /> {t("history_support_again")}
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
             <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <IndianRupee className="h-8 w-8" />
             </div>
             <p className="text-lg font-bold text-gray-900">{t("history_no_donations")}</p>
             <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2">
               {t("history_no_donations_desc")}
             </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
           <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
           <h3 className="text-blue-900 font-bold">{t("history_verification_timeline_title")}</h3>
           <p className="text-blue-700/80 text-sm font-medium mt-1 leading-relaxed">
             {t("history_verification_timeline_desc")}
           </p>
        </div>
      </div>
    </div>
  )
}
