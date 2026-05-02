import { createClient } from "@/lib/supabase/server"
import { AlertCircle, FileSpreadsheet, Download, ReceiptIndianRupee, CreditCard, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InvoiceGenerator } from "@/components/InvoiceGenerator"

export default async function PlatformInvoicesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch organization based on user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  let orgId = profile?.organization_id



  if (!orgId) return (
    <div className="py-20 text-center">
      <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-900">No Organization Found</h2>
      <p className="text-slate-500 mt-2">Could not find any verified organizations to display.</p>
    </div>
  )

  // Fetch Invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("organization_id", orgId)
    .order("billing_period_start", { ascending: false })

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Invoices & Billing</h1>
        <p className="text-slate-500 font-medium">PhilanthroForge is a SaaS tool. Manage your usage statements and access GST invoices below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl text-white overflow-hidden relative shadow-xl">
          <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4">
             <ReceiptIndianRupee className="h-24 w-24 text-slate-800/50" />
          </div>
          
          <h3 className="text-lg font-bold mb-2">Our Transparent Pricing Logic</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
            Direct bank transfers via UPI bear zero gateway fees in standard use. PhilanthroForge invoices organizations separately at 2% for SaaS usage (including verification algorithms, receipts printing, and AI Share features) ensuring zero opaque deductions.
          </p>
          
          <div className="flex gap-4">
             <Button className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold border-0">
               Update Billing Details
             </Button>
          </div>
        </div>

        <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100 flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-2">Current Balance</p>
          <div className="text-4xl font-black text-slate-900 mb-1">
            ₹{invoices?.filter(i => i.status !== 'paid').reduce((sum, i) => sum + Number(i.total_amount), 0).toLocaleString('en-IN') || "0.00"}
          </div>
          <p className="text-xs text-teal-800 font-medium font-mono">
            {invoices?.some(i => i.status !== 'paid') ? "Immediate action required" : "All dues cleared"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-teal-600" /> Billing History</h2>
        </div>
        
        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto text-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Billing Period</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">
                        {new Date(invoice.billing_period_start).toLocaleDateString()} - {new Date(invoice.billing_period_end).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400 font-medium font-mono mt-0.5">INV-{invoice.id.split("-")[0].toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-900">₹{Number(invoice.total_amount).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                       }`}>
                         {invoice.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status !== 'paid' && (
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100">
                            <CreditCard className="h-3 w-3" /> Pay Now
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-slate-500 hover:text-slate-900">
                          <Download className="h-3 w-3" /> PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <InvoiceGenerator orgId={orgId} />
        )}
      </div>

      {/* Tax Section Note */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
           <ExternalLink className="h-5 w-5 text-slate-400" />
        </div>
        <div className="flex-1 text-sm text-slate-600">
           <p className="font-bold text-slate-900 mb-1">Corporate Details & GST</p>
           <p>Updating your organization’s profile with accurate GST and legal jurisdiction establishes exact SaaS fee calculation based on current domestic billing rules.</p>
        </div>
      </div>
    </div>
  )
}
