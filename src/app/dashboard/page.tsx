import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Activity, UsersRound, ReceiptIndianRupee } from "lucide-react"

export default async function DashboardHub() {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  
  let orgId = null
  if (user?.user) {
    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.user.id).single()
    orgId = profile?.organization_id
  }

  // Fallback for MVP Presentation
  if (!orgId) {
    const { data: fallbackOrg } = await supabase.from("organizations").select("id").limit(1).single()
    orgId = fallbackOrg?.id
  }

  // Fetch KPI Data
  const { data: campaigns } = await supabase.from("campaigns").select("id, raised_amount, status").eq("organization_id", orgId)
  
  const { data: apps } = await supabase.from("beneficiary_applications").select("id").eq("organization_id", orgId).eq("status", "pending")
  
  // To fetch pending donations, we need campaign IDs
  const campaignIds = campaigns?.map(c => c.id) || []
  let pendingDonations: any[] | null = []
  if (campaignIds.length > 0) {
    const { data: pDonations } = await supabase.from("donations").select("id").in("campaign_id", campaignIds).eq("status", "pending")
    pendingDonations = pDonations
  }

  const activeCampaigns = campaigns?.filter(c => c.status === "published").length || 0
  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised_amount || 0), 0) || 0

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">NGO Dashboard Hub</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Funds Raised</CardTitle>
            <TrendingUp className="h-5 w-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">₹{totalRaised.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-1">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Campaigns</CardTitle>
            <Activity className="h-5 w-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{activeCampaigns}</div>
            <p className="text-xs text-slate-500 mt-1">Currently live and publishing</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Reviews</CardTitle>
            <UsersRound className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{apps?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Beneficiary applications to vet</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">UTRs to Verify</CardTitle>
            <ReceiptIndianRupee className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{pendingDonations?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting manual confirmation</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome to your Philanthroforge Hub</h3>
        <p className="text-slate-600 mb-6">
          From here, you can manage your digital fundraising presence. Create new campaigns with our 2% platform buffer, verify UTR payments from your bank account to issue official receipts, and review applications submitted by individuals in need.
        </p>
      </div>
    </div>
  )
}
