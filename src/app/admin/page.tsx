import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Building2, IndianRupee, Users } from "lucide-react"

export default async function AdminHub() {
  const supabase = await createClient()

  // Fetch macro analytics
  const { data: orgs } = await supabase.from("organizations").select("id, is_verified")
  const { data: campaigns } = await supabase.from("campaigns").select("raised_amount, platform_buffer")
  const { data: profiles } = await supabase.from("profiles").select("id")

  const totalOrgs = orgs?.length || 0
  const verifiedOrgs = orgs?.filter(o => o.is_verified).length || 0
  const totalUsers = profiles?.length || 0
  
  const totalPlatformVolume = campaigns?.reduce((sum, c) => sum + (c.raised_amount || 0), 0) || 0
  
  // Potential 2% Revenue generation based on campaigns that successfully raised amount
  // We assume the buffer constitutes ~2% of the public goal, so if they raised X, we earned ~2% of X (conceptually)
  const theoreticalRevenue = Math.round(totalPlatformVolume * 0.02)

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Platform HQ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Volume Flow</CardTitle>
            <IndianRupee className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">₹{totalPlatformVolume.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-1">Gross donations processed</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">2% Platform Earnings</CardTitle>
            <ShieldCheck className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">₹{theoreticalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-1">To be invoiced to NGOs</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total NGOs</CardTitle>
            <Building2 className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalOrgs}</div>
            <p className="text-xs text-slate-500 mt-1">{verifiedOrgs} highly verified</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Registered Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">Across all roles</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-3xl shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Super Admin Responsibilities</h3>
        <ul className="list-disc pl-5 space-y-3 text-slate-600">
           <li><strong>NGO Vetting:</strong> Approve or reject organizations based on 80G and PAN checks.</li>
           <li><strong>Platform Trust:</strong> Monitor campaigns for abuse or fraudulent claims.</li>
           <li><strong>Revenue Collection:</strong> Issue invoices to verified NGOs for the 2% support fee once campaigns reach thresholds.</li>
        </ul>
      </div>
    </div>
  )
}
