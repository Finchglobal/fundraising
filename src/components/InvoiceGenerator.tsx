"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle2, Loader2, Receipt } from "lucide-react"
import { toast } from "sonner"

export function InvoiceGenerator({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const generateInvoice = async () => {
    setLoading(true)
    
    try {
      // 1. Fetch verified donations for this org's campaigns
      const { data: donations, error: dError } = await supabase
        .from("donations")
        .select("amount, campaigns!inner(organization_id)")
        .eq("status", "verified")
        .eq("campaigns.organization_id", orgId)

      if (dError) throw dError

      // Calculate 2% SaaS fee
      const totalDonated = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      
      // If no donations, we'll create a small mock one for the demo
      const billAmount = totalDonated > 0 ? Math.round(totalDonated * 0.02) : 499

      // 2. Insert invoice
      const { error: iError } = await supabase
        .from("invoices")
        .insert({
          organization_id: orgId,
          billing_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          billing_period_end: new Date().toISOString(),
          total_amount: billAmount,
          status: 'pending'
        })

      if (iError) throw iError

      toast.success("Statement Generated", {
        description: `Successfully synced ${donations?.length || 0} donations for this period.`
      })
      
      router.refresh()
    } catch (error: any) {
      toast.error("Generation failed", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
      <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
        <Receipt className="h-6 w-6 text-teal-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">No Statement Found</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        Generate your current billing statement based on successfully verified UPI donations this month.
      </p>
      <Button 
        onClick={generateInvoice} 
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-500 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-teal-500/10 transition-all active:scale-95"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Calculating Statement...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync & Generate Invoice
          </>
        )}
      </Button>
      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <CheckCircle2 className="h-3 w-3 text-teal-500" /> Auto-Generated via SaaS Ledger
      </div>
    </div>
  )
}
