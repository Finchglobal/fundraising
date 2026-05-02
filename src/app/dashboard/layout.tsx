import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { HeartPulse, LayoutDashboard, Send, UsersRound, ReceiptIndianRupee, LogOut, Share2, FileSpreadsheet, ShieldCheck, Building2, BookUser, ExternalLink } from "lucide-react"
import { LogoutLink } from "@/components/LogoutLink"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  
  if (!user?.user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id, organizations(id, name, verification_status)")
    .eq("id", user.user.id)
    .single()
  
  if (profile?.role !== 'ngo_admin') {
    if (profile?.role === 'super_admin') redirect("/admin")
    redirect("/donor")
  }

  const orgId = profile?.organization_id
  const org = profile?.organizations as any
  const orgName = org?.name || "NGO Admin"

  if (!orgId) {
    redirect("/onboarding")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 flex-shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-teal-500" />
          <span className="font-bold text-lg text-white">NGO Portal</span>
        </div>
        
        <div className="p-6 pb-2">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Organization</p>
          <p className="font-medium text-white truncate" title={orgName}>{orgName}</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="h-5 w-5 text-teal-500" /> Dashboard
          </Link>
          <Link href="/dashboard/campaigns/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Send className="h-5 w-5 text-teal-500" /> Create Campaign
          </Link>
          <Link href="/dashboard/requests" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <UsersRound className="h-5 w-5 text-teal-500" /> Fundraiser Requests
          </Link>
          <Link href="/dashboard/applications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <UsersRound className="h-5 w-5 text-teal-500" /> Beneficiary Queue
          </Link>
          <Link href="/dashboard/donations" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <ReceiptIndianRupee className="h-5 w-5 text-teal-500" /> Verify UTRs
          </Link>
          <Link href="/dashboard/donors" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <BookUser className="h-5 w-5 text-teal-500" /> Donor CRM
          </Link>
          <Link href="/dashboard/share" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Share2 className="h-5 w-5 text-teal-500" /> AI Share Studio
          </Link>
          <Link href="/dashboard/compliance" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <ShieldCheck className="h-5 w-5 text-teal-500" /> CSR Compliance
          </Link>
          <Link href="/dashboard/invoices" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <FileSpreadsheet className="h-5 w-5 text-teal-500" /> Platform Invoices
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Building2 className="h-5 w-5 text-teal-500" /> Profile Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-1">
           {orgId && (
             <Link href={`/organizations/${orgId}`} target="_blank" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">
               <ExternalLink className="h-4 w-4" /> View Public Profile
             </Link>
           )}
           <LogoutLink />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
         {org?.verification_status === 'revision_requested' && (
           <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-800 flex items-start gap-3 shadow-sm">
             <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
             <div>
               <h3 className="font-bold">Action Required: Compliance Verification</h3>
               <p className="text-sm mt-1">Our team reviewed your NGO details but needs some revisions before we can verify your account. Please review the feedback and update your documents.</p>
               <Link href="/dashboard/compliance" className="inline-block mt-3 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-bold rounded-lg transition-colors">
                 Review Feedback & Fix
               </Link>
             </div>
           </div>
         )}
         {children}
      </main>
    </div>
  )
}
