import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UsersRound, ExternalLink, Calendar, ReceiptIndianRupee, Activity, Search } from "lucide-react"

export default async function DonorsCRMPage() {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let orgId = null

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()
    
  orgId = profile?.organization_id

  // MVP Mock Auth check
  if (!orgId) {
    const { data: fallbackOrg } = await supabase.from("organizations").select("id").limit(1).single()
    orgId = fallbackOrg?.id
  }

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Organization Connected</h2>
        <p className="text-slate-600 max-w-md">You need to register an NGO before accessing the CRM.</p>
      </div>
    )
  }

  // 2. Fetch all verified donations for this organization's campaigns
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id")
    .eq("organization_id", orgId)

  const campaignIds = campaigns?.map(c => c.id) || []
  let allDonations: any[] = []

  if (campaignIds.length > 0) {
    const { data: donations } = await supabase
      .from("donations")
      .select("amount, created_at, donor_name, donor_email, is_anonymous")
      .in("campaign_id", campaignIds)
      .eq("status", "verified")
      .order("created_at", { ascending: false })
      
    allDonations = donations || []
  }

  // 3. Group by email to create Donor Profiles
  const donorMap: Record<string, {
    email: string;
    originalName: string;
    totalAmount: number;
    donationCount: number;
    lastDonation: string;
    isAnonymous: boolean;
  }> = {}

  let totalRepeatDonors = 0

  allDonations.forEach(d => {
    const emailKey = d.donor_email || d.donor_name // fallback to name if email is somehow missing
    const amount = Number(d.amount) || 0

    if (!donorMap[emailKey]) {
      donorMap[emailKey] = {
        email: d.donor_email || "",
        originalName: d.donor_name,
        totalAmount: 0,
        donationCount: 0,
        lastDonation: d.created_at,
        isAnonymous: d.is_anonymous
      }
    }
    
    donorMap[emailKey].totalAmount += amount
    donorMap[emailKey].donationCount += 1
  })

  // Calculate repeat donors
  const donorsList = Object.values(donorMap).sort((a, b) => b.totalAmount - a.totalAmount)
  totalRepeatDonors = donorsList.filter(d => d.donationCount > 1).length
  const totalUniqueDonors = donorsList.length

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-2">
          <UsersRound className="h-8 w-8 text-indigo-600" /> Donor Database
        </h1>
        <p className="text-slate-500 font-medium">Track your community, manage relationships, and identify recurring supporters.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
             <UsersRound className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Donors</p>
            <p className="text-3xl font-black text-slate-900">{totalUniqueDonors}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
             <Activity className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Repeat Donors</p>
            <p className="text-3xl font-black text-slate-900">{totalRepeatDonors}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-teal-50 rounded-full blur-2xl opacity-50"></div>
          <div className="z-10 relative space-y-1">
             <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Pledges</p>
             <p className="text-3xl font-black text-slate-300">Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Donor Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <h2 className="font-bold text-slate-800">Community Directory</h2>
           <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input type="text" placeholder="Search donors..." className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" disabled />
           </div>
        </div>

        {donorsList.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
             <UsersRound className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="font-medium">No verified donors found.</p>
             <p className="text-sm mt-1">Once donations are verified via the UTR flow, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Donor Name</th>
                  <th className="px-6 py-4">Total Contribution</th>
                  <th className="px-6 py-4">Donations</th>
                  <th className="px-6 py-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {donorsList.map((donor, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white">
                          {donor.originalName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{donor.isAnonymous ? "Anonymous Donor" : donor.originalName}</p>
                          <p className="text-xs text-slate-400">{donor.email || "No email provided"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black justify-start text-slate-800">
                      ₹{donor.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {donor.donationCount > 1 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg">
                          <Activity className="h-3 w-3" /> {donor.donationCount} TIMES
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium ml-2">{donor.donationCount} time</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium flex items-center gap-2">
                       <Calendar className="h-4 w-4 text-slate-300" />
                       {new Date(donor.lastDonation).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
