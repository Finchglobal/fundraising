"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldX, Building2, Loader2, RefreshCw, ExternalLink, FileCheck2, CheckCircle2, Clock } from "lucide-react"

export default function NGOVerificationPage() {
  const supabase = createClient()
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("pending")

  const fetchOrgs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("organizations")
      .select("*, profiles(id, full_name)")
      .order("created_at", { ascending: false })
    if (data) setOrgs(data)
    setLoading(false)
  }

  useEffect(() => { fetchOrgs() }, [])

  const handleVerify = async (id: string) => {
    setActionLoading(id)
    await supabase.from("organizations").update({ is_verified: true }).eq("id", id)
    setOrgs(prev => prev.map(o => o.id === id ? { ...o, is_verified: true } : o))
    setActionLoading(null)
  }

  const handleRevoke = async (id: string) => {
    setActionLoading(id)
    await supabase.from("organizations").update({ is_verified: false }).eq("id", id)
    setOrgs(prev => prev.map(o => o.id === id ? { ...o, is_verified: false } : o))
    setActionLoading(null)
  }

  const filtered = orgs.filter(o => {
    if (filter === "pending") return !o.is_verified
    if (filter === "verified") return o.is_verified
    return true
  })

  const pendingCount = orgs.filter(o => !o.is_verified).length
  const verifiedCount = orgs.filter(o => o.is_verified).length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-purple-500" /> NGO Verification Queue
          </h1>
          <p className="text-slate-600">Review and approve registered trusts and NGOs before they can publish campaigns.</p>
        </div>
        <Button variant="outline" onClick={fetchOrgs} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card
          onClick={() => setFilter("all")}
          className={`cursor-pointer transition-all border-2 ${filter === "all" ? "border-slate-900" : "border-slate-200 hover:border-slate-300"}`}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{orgs.length}</div>
              <p className="text-xs text-slate-500">Total NGOs</p>
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={() => setFilter("pending")}
          className={`cursor-pointer transition-all border-2 ${filter === "pending" ? "border-amber-400" : "border-slate-200 hover:border-amber-200"}`}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-700">{pendingCount}</div>
              <p className="text-xs text-slate-500">Awaiting Verification</p>
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={() => setFilter("verified")}
          className={`cursor-pointer transition-all border-2 ${filter === "verified" ? "border-teal-400" : "border-slate-200 hover:border-teal-200"}`}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-teal-700">{verifiedCount}</div>
              <p className="text-xs text-slate-500">Verified & Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NGO List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
            Loading organizations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500">
            <ShieldCheck className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            No organizations in this category.
          </div>
        ) : (
          filtered.map(org => (
            <Card key={org.id} className={`border transition-all ${org.is_verified ? "border-teal-100 bg-teal-50/20" : "border-slate-200"}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Logo + Info */}
                  <div className="flex items-center gap-5 flex-1">
                    <div className="h-14 w-14 bg-white rounded-full border border-slate-200 flex-shrink-0 overflow-hidden shadow-sm">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg font-bold">
                          {org.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">{org.name}</h3>
                        {org.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-teal-100 text-teal-700 rounded-full border border-teal-200">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                            <Clock className="h-3 w-3" /> Pending Review
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{org.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileCheck2 className="h-3 w-3" /> PAN: {org.pan_number || "Not provided"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> Reg: {org.registration_number || "Not provided"}
                        </span>
                        <span className="flex items-center gap-1">
                          UPI: {org.upi_id || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <a href={`/organizations/${org.id}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="gap-1.5 text-slate-600">
                        <ExternalLink className="h-4 w-4" /> Public Profile
                      </Button>
                    </a>
                    {org.is_verified ? (
                      <Button
                        variant="outline" size="sm"
                        className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 gap-1.5"
                        disabled={actionLoading === org.id}
                        onClick={() => handleRevoke(org.id)}
                      >
                        {actionLoading === org.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldX className="h-4 w-4" />}
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-500 text-white gap-1.5"
                        disabled={actionLoading === org.id}
                        onClick={() => handleVerify(org.id)}
                      >
                        {actionLoading === org.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Verify & Approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Policy Note */}
      <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-800 flex gap-3 items-start">
        <ShieldCheck className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-1">Compliance Responsibility</strong>
          Only verified NGOs and registered trusts with valid PAN and 12A/80G documents should be approved. 
          Philanthroforge bears no financial or legal liability for campaigns published before proper verification.
        </div>
      </div>
    </div>
  )
}
