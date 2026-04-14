import { createClient } from "@/lib/supabase/server"
import { Heart, ShieldCheck, IndianRupee, Clock, ArrowRight, TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"
import DonorReceiptButton from "@/components/donor/DonorReceiptButton"
import { ShareButton } from "@/components/ui/ShareButton"

export default async function DonorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch cumulative stats
  const { data: donations } = await supabase
    .from("donations")
    .select("*, campaigns(title, organization_id, organizations(*))")
    .eq("donor_id", user.id)

  const verifiedDonations = donations?.filter(d => d.status === "verified") || []
  const totalImpact = verifiedDonations.reduce((acc, d) => acc + (Number(d.amount) || 0), 0)
  const uniqueNGOs = new Set(verifiedDonations.map(d => (d.campaigns as any)?.organizations?.name)).size
  const pendingCount = donations?.filter(d => d.status === "pending").length || 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Impact Overview</h1>
        <p className="text-gray-500 font-medium">Thank you for being part of the change.</p>
      </div>

      {/* Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
            <IndianRupee className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Impact</p>
            <p className="text-3xl font-black text-gray-900">₹{totalImpact.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Causes Supported</p>
            <p className="text-3xl font-black text-gray-900">{uniqueNGOs}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Verification Pending</p>
            <p className="text-3xl font-black text-gray-900">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-900">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Contributions</h2>
            <Link href="/donor/history" className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1 group">
              View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {donations && donations.length > 0 ? (
              donations.slice(0, 5).map((d: any, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-green-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${d.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {d.status === 'verified' ? <ShieldCheck className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-xs">{d.campaigns?.title}</p>
                      <p className="text-xs text-gray-500 font-medium">To: {d.campaigns?.organizations?.name}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-black text-gray-900">₹{Number(d.amount).toLocaleString()}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${d.status === 'verified' ? 'text-green-600' : 'text-blue-600'}`}>
                      {d.status}
                    </p>
                    {d.status === 'verified' && <DonorReceiptButton donation={d} />}
                    {d.campaigns?.id && (
                      <ShareButton
                        campaignId={d.campaigns.id}
                        campaignTitle={d.campaigns.title}
                        className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 justify-end font-bold"
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <p className="text-gray-400 font-medium mb-4">No activity yet. Start your journey today!</p>
                <Link href="/#campaigns" className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 hover:bg-green-400 transition-all">
                  Find a Cause
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Trust & Give Again */}
        <div className="space-y-6">
          <div className="bg-green-950 rounded-2xl p-6 text-white overflow-hidden relative group">
            <TrendingUp className="absolute -right-4 -bottom-4 h-32 w-32 text-green-900 opacity-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <h3 className="text-lg font-bold mb-2">Transparency First</h3>
            <p className="text-green-200 text-sm leading-relaxed mb-6 opacity-80">
              Every donation you make is tracked via bank statements. Once verified, your status updates in real-time.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-900/50 p-2.5 rounded-lg border border-green-800/50">
                <ShieldCheck className="h-4 w-4" /> 100% Secure UPI 
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-900/50 p-2.5 rounded-lg border border-green-800/50">
                <Heart className="h-4 w-4" /> Zero Platform Fees
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-green-600" /> Global Impact
             </h3>
             <div className="space-y-4">
                <p className="text-sm text-gray-500 font-medium">Your contributions have helped Philanthroforge cross ₹10,00,000 in collective impact this month!</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 rounded-full w-[65%] shadow-sm"></div>
                </div>
             </div>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-indigo-900">Become an Ambassador</h3>
            </div>
            <p className="text-sm text-indigo-700 leading-relaxed mb-4">
              Share campaigns you love and track exactly how many people donate because of you.
            </p>
            <Link 
              href="/ambassador/onboarding"
              className="block text-center w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm shadow-indigo-500/20 transition-all"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
