"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { UsersRound, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { approveCampaignRequest, rejectCampaignRequest } from "./actions"
import { toast } from "sonner"

export default function FundraiserRequestsPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function fetchRequests() {
    setLoading(true)
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.user.id)
      .single()

    if (profile?.organization_id) {
      // For this MVP, we consider any campaign with status 'draft' linked to this org to be a request
      // If the `requested_by` column migration is run, we could filter by `requested_by.not.is.null`
      const { data } = await supabase
        .from("campaigns")
        .select("*, profiles!campaigns_requested_by_fkey(full_name, email)")
        .eq("organization_id", profile.organization_id)
        .eq("status", "draft")
        .order("created_at", { ascending: false })
      
      // Since the migration might not be run, we'll gracefully handle it if the query fails due to missing relationship
      if (data) {
        setRequests(data)
      } else {
        // Fallback if foreign key `profiles` is not yet available
        const { data: fallbackData } = await supabase
          .from("campaigns")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .eq("status", "draft")
          .order("created_at", { ascending: false })
        
        if (fallbackData) setRequests(fallbackData)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  async function handleApprove(id: string) {
    setActionLoading(id)
    const res = await approveCampaignRequest(id)
    setActionLoading(null)
    if (res.success) {
      toast.success("Campaign approved and published!")
      fetchRequests()
    } else {
      toast.error(res.error)
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Are you sure you want to reject and delete this request?")) return
    setActionLoading(id)
    const res = await rejectCampaignRequest(id)
    setActionLoading(null)
    if (res.success) {
      toast.success("Campaign request rejected.")
      fetchRequests()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <UsersRound className="h-8 w-8 text-teal-500" />
          Fundraiser Requests
        </h1>
        <p className="mt-2 text-slate-600 font-medium">
          Review campaigns created by donors on behalf of your organization.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <UsersRound className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Pending Requests</h3>
          <p className="text-slate-500 mt-2">You don't have any fundraiser requests from donors to review.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full uppercase tracking-wider">
                    Needs Approval
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Requested {new Date(request.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{request.title}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{request.story}</p>
                <div className="bg-slate-50 rounded-xl p-4 inline-block">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Target Amount</div>
                  <div className="text-xl font-black text-teal-600">₹{request.actual_need?.toLocaleString() || "0"}</div>
                </div>
                
                {request.profiles && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                    Requested by: <span className="font-bold text-slate-700">{request.profiles.full_name}</span> ({request.profiles.email})
                  </div>
                )}
              </div>
              
              <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleApprove(request.id)}
                  disabled={actionLoading === request.id}
                  className="flex-1 md:w-40 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-teal-500/20"
                >
                  {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  disabled={actionLoading === request.id}
                  className="flex-1 md:w-40 bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
