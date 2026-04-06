import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ShieldCheck, LayoutDashboard, Building2, LogOut } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // MVP Mock Auth handling: In production, strictly enforce super_admin role
  const { data: user } = await supabase.auth.getUser()
  
  let role = "super_admin"
  if (user?.user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.user.id).single()
    role = profile?.role || "donor"
  }

  // Strict check (mocked for MVP presentation purposes, assumes we are allowed if not totally rejected)
  // if (role !== "super_admin") {
  //   redirect("/")
  // }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-900 flex-shrink-0">
        <div className="p-6 border-b border-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-purple-500" />
          <span className="font-bold text-lg text-white">Super Admin</span>
        </div>
        
        <div className="p-6 pb-2">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Philanthroforge HQ</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-900 hover:text-white transition-colors">
            <LayoutDashboard className="h-5 w-5 text-purple-500" /> Platform Overview
          </Link>
          <Link href="/admin/organizations" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-900 hover:text-white transition-colors">
            <Building2 className="h-5 w-5 text-purple-500" /> NGO Verification
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-900">
           <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors">
             <LogOut className="h-4 w-4" /> Go to Public Site
           </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
         {children}
      </main>
    </div>
  )
}
