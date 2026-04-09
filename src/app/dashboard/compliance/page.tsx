import { createClient } from "@/lib/supabase/server"
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, UploadCloud, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function CSRCompliancePage() {
  const supabase = await createClient()

  // Simplified MVP auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch organization based on user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return (
    <div className="py-20 text-center">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900">No Organization Linked</h2>
      <p className="text-gray-500 mt-2">You need to be part of a verified NGO to view this page.</p>
    </div>
  )

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single()

  if (!org) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">CSR Readiness & Compliance</h1>
        <p className="text-slate-500 font-medium">Manage your tax exemptions and mandatory corporate compliance disclosures.</p>
      </div>

      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
        <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-blue-900">Why fill this out?</h3>
          <p className="text-sm text-blue-800/80 leading-relaxed mt-1 hidden sm:block">
            Institutional funders and CSR teams prioritize organizations with transparent governance. Completing this section unlocks the ability to issue 80G tax receipts and makes your NGO eligible for matching-grant pools.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 text-slate-900">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600" /> 12A Registration</h3>
            {org.registration_12a ? (
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
            ) : (
              <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-4">Allows your trust/society to claim exemption from paying income tax.</p>
          <input 
            type="text" 
            placeholder="e.g. AAATT1234E1234" 
            defaultValue={org.registration_12a || ""}
            className="w-full text-sm border-b border-slate-200 py-2 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600" /> 80G Registration</h3>
             {org.registration_80g ? (
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
            ) : (
              <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-4">Enables donors to claim 50% tax deductions on their contributions.</p>
          <input 
            type="text" 
            placeholder="e.g. AAATT1234E1234" 
            defaultValue={org.registration_80g || ""}
            className="w-full text-sm border-b border-slate-200 py-2 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600" /> CSR-1 Number</h3>
            {org.csr_1_registration ? (
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
            ) : (
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Optional</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-4">MCA registration required for receiving corporate CSR funds in India.</p>
          <input 
             type="text"
             placeholder="e.g. CSR00012345"
             defaultValue={org.csr_1_registration || ""}
             className="w-full text-sm border-b border-slate-200 py-2 focus:outline-none focus:border-teal-500 font-medium" 
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600" /> FCRA Account</h3>
            {org.fcra_registration ? (
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
            ) : (
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Optional</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-4">Required by MHA to receive foreign donations legally in India.</p>
          <input 
             type="text"
             placeholder="e.g. 123450000"
             defaultValue={org.fcra_registration || ""}
             className="w-full text-sm border-b border-slate-200 py-2 focus:outline-none focus:border-teal-500 font-medium" 
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button className="bg-teal-600 hover:bg-teal-500 text-white font-bold w-full sm:w-auto shadow-lg shadow-teal-500/20">
           <RefreshCw className="h-4 w-4 mr-2" /> Save Compliance Settings
        </Button>
      </div>

    </div>
  )
}
