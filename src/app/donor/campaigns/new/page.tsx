"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Building2, Heart, Info, Loader2, Send, Mail } from "lucide-react"
import { toast } from "sonner"
import { requestCampaign, inviteNGO } from "./actions"

export default function DonorCreateCampaignPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  const [title, setTitle] = useState("")
  const [story, setStory] = useState("")
  const [actualNeed, setActualNeed] = useState("")
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [loading, setLoading] = useState(false)

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [ngoName, setNgoName] = useState("")
  const [ngoEmail, setNgoEmail] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    async function fetchOrgs() {
      const { data } = await supabase
        .from("organizations")
        .select("id, name")
        .order("name", { ascending: true })
      
      if (data) setOrganizations(data)
      setLoadingOrgs(false)
    }
    fetchOrgs()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedOrgId) {
      toast.error("Please select a Nonprofit/Trust")
      return
    }

    setLoading(true)
    const result = await requestCampaign({
      title,
      story,
      actual_need: parseInt(actualNeed),
      organization_id: selectedOrgId
    })

    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Fundraiser request sent to the Nonprofit for approval!")
      router.push("/donor")
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteLoading(true)
    
    const result = await inviteNGO({
      ngoName,
      ngoEmail
    })

    setInviteLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Invite sent to ${ngoName}! You can create your campaign once they join.`)
      setShowInviteModal(false)
      setNgoName("")
      setNgoEmail("")
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Heart className="h-8 w-8 text-green-500" /> 
          Request a Fundraiser
        </h1>
        <p className="mt-2 text-gray-600 font-medium">
          Create a campaign on behalf of your favorite Nonprofit or Trust. They will review and approve your request.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Select Nonprofit/Trust</label>
            {loadingOrgs ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading organizations...
              </div>
            ) : (
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
              >
                <option value="" disabled>Select an organization nearest to you...</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            )}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Info className="h-4 w-4" /> The NGO will receive an automated email to approve this request.
              </p>
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline"
              >
                Couldn't find your Nonprofit/Trust? Invite them
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">Campaign Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Help rebuild the local community center"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Target Amount (₹)</label>
            <input
              type="number"
              value={actualNeed}
              onChange={(e) => setActualNeed(e.target.value)}
              required
              min="1000"
              placeholder="e.g. 50000"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Campaign Story</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              required
              rows={5}
              placeholder="Tell the story of why this fundraiser is needed..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedOrgId}
            className="w-full bg-green-500 hover:bg-green-400 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            Send Request to Nonprofit
          </button>
        </form>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Invite a Nonprofit/Trust</h3>
              <p className="text-sm text-gray-500 mt-1">Send an automated email invite so they can complete onboarding.</p>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Nonprofit/Trust Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={ngoName}
                    onChange={(e) => setNgoName(e.target.value)}
                    required
                    placeholder="e.g. Global Health Initiative"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Nonprofit Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={ngoEmail}
                    onChange={(e) => setNgoEmail(e.target.value)}
                    required
                    placeholder="contact@ngo.org"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-green-500 hover:bg-green-400 disabled:opacity-70 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
