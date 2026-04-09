import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ShieldCheck, LayoutDashboard, History, Heart, LogOut, Search } from "lucide-react"

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "donor") {
    // If they aren't a donor, they shouldn't be here
    if (profile?.role === "ngo_admin") redirect("/dashboard")
    if (profile?.role === "super_admin") redirect("/admin")
    redirect("/")
  }

  const donorName = profile?.full_name || "Impact Donor"

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-green-950 text-green-100 flex flex-col border-r border-green-900 flex-shrink-0">
        <div className="p-6 border-b border-green-900 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-green-400" />
          <span className="font-bold text-lg text-white">Donor Portal</span>
        </div>
        
        <div className="p-6 pb-2">
          <p className="text-xs uppercase tracking-wider text-green-500 font-semibold mb-2">Member</p>
          <p className="font-medium text-white truncate" title={donorName}>{donorName}</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/donor" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-900 hover:text-white transition-colors">
            <LayoutDashboard className="h-5 w-5 text-green-400" /> My Impact
          </Link>
          <Link href="/donor/history" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-900 hover:text-white transition-colors">
            <History className="h-5 w-5 text-green-400" /> Donation History
          </Link>
          <Link href="/#campaigns" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-900 hover:text-white transition-colors">
            <Search className="h-5 w-5 text-green-400" /> Explore Causes
          </Link>
        </nav>

        <div className="p-4 border-t border-green-900">
           <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-green-400 hover:text-white hover:bg-green-900 transition-colors">
             <LogOut className="h-4 w-4" /> Exit to Public Site
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto bg-gray-50/50">
         {children}
      </main>
    </div>
  )
}
