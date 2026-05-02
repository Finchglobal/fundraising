"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, ShieldCheck, AlertCircle, FileText, Upload, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function CSRCompliancePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [orgData, setOrgData] = useState<any>(null)
  const [feedback, setFeedback] = useState<Record<string, { status: "approve" | "revise", comment: string }>>({})
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, organizations(*)")
        .eq("id", user.id)
        .single()

      if (profile?.organization_id && profile.organizations) {
        setOrgId(profile.organization_id)
        const org: any = profile.organizations
        setOrgData(org)
        setFormData({
          name: org.name || "",
          pan_number: org.pan_number || "",
          registration_number: org.registration_number || "",
          upi_id: org.upi_id || "",
          registration_certificate_url: org.registration_certificate_url || "",
          registration_12a: org.registration_12a || "",
          registration_80g: org.registration_80g || "",
          csr_1_registration: org.csr_1_registration || "",
        })
        if (org.verification_comments) {
          setFeedback(org.verification_comments)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.")
      return
    }

    setUploadingDoc(fieldName)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${orgId}-${fieldName}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `certificates/${fileName}`

      const { data, error } = await supabase.storage.from("documents").upload(filePath, file)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, [fieldName]: publicUrl }))
      toast.success("Document uploaded successfully!")
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message })
    } finally {
      setUploadingDoc(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return

    setSaving(true)
    
    // Determine if we need to clear revision_requested
    // If they are saving, we submit for re-review.
    const newStatus = orgData.verification_status === "revision_requested" ? "pending" : orgData.verification_status
    
    const { error } = await supabase
      .from("organizations")
      .update({
        ...formData,
        verification_status: newStatus
      })
      .eq("id", orgId)

    if (error) {
      toast.error("Failed to submit updates", { description: error.message })
    } else {
      toast.success("Updates submitted for review!")
      // Update local state to reflect 'pending'
      setOrgData((prev: any) => ({ ...prev, verification_status: newStatus }))
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
  }

  if (!orgId) {
    return <div className="text-center py-20 text-slate-500">No organizations found.</div>
  }

  const fieldsToReview = [
    { key: "name", label: "Organization Name", type: "text" },
    { key: "pan_number", label: "PAN Number", type: "text" },
    { key: "registration_number", label: "Registration Number", type: "text" },
    { key: "upi_id", label: "UPI ID", type: "text" },
    { key: "registration_certificate_url", label: "Registration Certificate", type: "file" },
    { key: "registration_12a", label: "12A Certificate", type: "file" },
    { key: "registration_80g", label: "80G Certificate", type: "file" },
    { key: "csr_1_registration", label: "CSR-1 Certificate", type: "file" },
  ]

  // Filter out fields that don't need revision unless we are in an error state
  const hasRevisions = Object.values(feedback).some(f => f.status === "revise")
  const isPending = orgData.verification_status === "pending"
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">CSR Compliance & Verification</h1>
        <p className="text-slate-600">Review your verification status and upload missing documents.</p>
      </div>

      <div className="mb-6">
        {orgData.verification_status === 'approved' && (
          <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-teal-600" />
            <div>
              <p className="font-bold">Your Organization is Verified</p>
              <p className="text-sm">All documents have been approved. You are good to go!</p>
            </div>
          </div>
        )}
        {orgData.verification_status === 'revision_requested' && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Revisions Requested</p>
              <p className="text-sm mt-1">Please fix the issues highlighted below and re-submit for verification.</p>
            </div>
          </div>
        )}
        {orgData.verification_status === 'pending' && (
          <div className="p-4 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
            <div>
              <p className="font-bold">Verification Pending</p>
              <p className="text-sm">Your profile is currently under review by our team.</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {fieldsToReview.map(field => {
          const fieldFeedback = feedback[field.key]
          
          const needsRevision = fieldFeedback?.status === 'revise'
          const isReadOnly = orgData.verification_status === 'approved' || (hasRevisions && !needsRevision)

          if (!formData[field.key] && !needsRevision) return null // Hide empty optional fields if not asked to revise

          return (
            <Card key={field.key} className={`border-2 transition-colors ${needsRevision ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <Label className="text-base font-bold text-slate-800">{field.label}</Label>
                    
                    {field.type === "text" ? (
                      <Input
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        disabled={isReadOnly}
                        className={needsRevision ? "border-amber-300 focus-visible:ring-amber-500 bg-white" : "bg-slate-50"}
                      />
                    ) : (
                      <div className="space-y-4">
                        {formData[field.key] ? (
                          <div className="flex items-center gap-3">
                            <a href={formData[field.key]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                              <FileText className="h-5 w-5 text-teal-600" />
                              View Uploaded PDF
                            </a>
                            {!isReadOnly && <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">or Replace:</span>}
                          </div>
                        ) : null}
                        
                        {!isReadOnly && (
                          <div className="relative">
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => handleFileUpload(e, field.key)}
                              disabled={uploadingDoc === field.key}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 group hover:border-teal-400 hover:bg-teal-50 transition-colors">
                              {uploadingDoc === field.key ? (
                                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                              ) : (
                                <Upload className="h-5 w-5 group-hover:text-teal-600" />
                              )}
                              <span className="font-semibold">{formData[field.key] ? "Upload Replacement PDF" : "Upload PDF"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {needsRevision && (
                    <div className="md:w-72 bg-amber-100/50 p-4 rounded-xl border border-amber-200 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm uppercase tracking-wider">
                        <AlertCircle className="h-4 w-4" /> Feedback
                      </div>
                      <p className="text-sm text-amber-900">{fieldFeedback.comment || "Please review and update this field."}</p>
                    </div>
                  )}
                  
                  {fieldFeedback?.status === 'approve' && (
                    <div className="md:w-72 flex items-center justify-center p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-teal-600 font-bold">
                        <CheckCircle2 className="h-5 w-5" /> Approved
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {orgData.verification_status !== 'approved' && !isPending && (
          <div className="pt-6 flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 h-12 text-lg font-bold rounded-xl shadow-lg shadow-teal-500/20"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {hasRevisions ? "Submit Revisions for Review" : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
