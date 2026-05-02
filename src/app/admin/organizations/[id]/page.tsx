"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Loader2, ExternalLink, ArrowLeft, AlertCircle, FileText, CheckCircle2, ShieldX } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { use } from "react"

export default function OrganizationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const resolvedParams = use(params)
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, { status: "approve" | "revise", comment: string }>>({})

  useEffect(() => {
    async function fetchOrg() {
      const { data } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()
      
      if (data) {
        setOrg(data)
        if (data.verification_comments) {
          setFeedback(data.verification_comments)
        }
      }
      setLoading(false)
    }
    fetchOrg()
  }, [resolvedParams.id])

  const setFieldStatus = (field: string, status: "approve" | "revise") => {
    setFeedback(prev => ({
      ...prev,
      [field]: { status, comment: status === "approve" ? "" : (prev[field]?.comment || "") }
    }))
  }

  const setFieldComment = (field: string, comment: string) => {
    setFeedback(prev => ({
      ...prev,
      [field]: { ...prev[field], comment }
    }))
  }

  const handleSaveReview = async () => {
    setSaving(true)
    
    // Determine overall status
    const hasRevisions = Object.values(feedback).some(f => f.status === "revise")
    const newStatus = hasRevisions ? "revision_requested" : "approved"
    const isVerified = newStatus === "approved"

    const { error } = await supabase
      .from("organizations")
      .update({
        verification_status: newStatus,
        verification_comments: feedback,
        is_verified: isVerified
      })
      .eq("id", resolvedParams.id)

    if (error) {
      toast.error("Failed to save review", { description: error.message })
    } else {
      toast.success(`Organization ${newStatus === "approved" ? "Approved" : "Revision Requested"}`)
      router.push("/admin/organizations")
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
  }

  if (!org) {
    return <div className="text-center py-20">Organization not found.</div>
  }

  const fieldsToReview = [
    { key: "name", label: "Organization Name", value: org.name, type: "text" },
    { key: "pan_number", label: "PAN Number", value: org.pan_number, type: "text" },
    { key: "registration_number", label: "Registration Number", value: org.registration_number, type: "text" },
    { key: "upi_id", label: "UPI ID", value: org.upi_id, type: "text" },
    { key: "registration_certificate_url", label: "Registration Certificate", value: org.registration_certificate_url, type: "file" },
    { key: "registration_12a", label: "12A Certificate", value: org.registration_12a, type: "file" },
    { key: "registration_80g", label: "80G Certificate", value: org.registration_80g, type: "file" },
    { key: "csr_1_registration", label: "CSR-1 Certificate", value: org.csr_1_registration, type: "file" },
  ]

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6">
        <Link href="/admin/organizations" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Queue
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Review: {org.name}</h1>
          <p className="text-slate-600">Review all details and documents carefully before approving.</p>
        </div>
        <div className="px-4 py-2 rounded-xl border font-bold text-sm bg-white">
          Status: <span className="uppercase text-purple-600">{org.verification_status || 'Pending'}</span>
        </div>
      </div>

      <div className="space-y-6">
        {fieldsToReview.map((field) => {
          if (!field.value) return null; // Skip empty optional fields

          const currentFeedback = feedback[field.key] || { status: "approve", comment: "" }
          
          return (
            <Card key={field.key} className={`border-2 transition-colors ${currentFeedback.status === 'revise' ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Field Data */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">{field.label}</h3>
                    {field.type === "text" ? (
                      <p className="text-lg font-medium text-slate-900">{field.value}</p>
                    ) : (
                      <a href={field.value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                        <FileText className="h-5 w-5 text-purple-600" />
                        View Document
                        <ExternalLink className="h-4 w-4 ml-1 opacity-50" />
                      </a>
                    )}
                  </div>

                  {/* Review Actions */}
                  <div className="md:w-72 flex-shrink-0 space-y-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setFieldStatus(field.key, "approve")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${currentFeedback.status === "approve" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => setFieldStatus(field.key, "revise")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${currentFeedback.status === "revise" ? "bg-amber-100 text-amber-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        <AlertCircle className="h-4 w-4" /> Revise
                      </button>
                    </div>

                    {currentFeedback.status === "revise" && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <textarea
                          placeholder="What needs to be fixed?"
                          className="w-full text-sm p-3 rounded-lg border border-amber-200 bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                          rows={3}
                          value={currentFeedback.comment}
                          onChange={(e) => setFieldComment(field.key, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 pt-8 border-t flex justify-end">
        <Button 
          onClick={handleSaveReview} 
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-500 text-white px-8 h-12 text-lg font-bold rounded-xl shadow-lg shadow-purple-500/20"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
          Submit Verification Review
        </Button>
      </div>
    </div>
  )
}
