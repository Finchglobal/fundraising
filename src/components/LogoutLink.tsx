"use client"

import { createClient } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface LogoutLinkProps {
  className?: string
  variant?: "ngo" | "donor" | "admin"
}

export function LogoutLink({ className, variant }: LogoutLinkProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Doing a full page refresh to / to clear all user states and cache
    window.location.href = "/"
  }

  return (
    <button 
      onClick={handleSignOut}
      className={className || "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full text-left"}
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </button>
  )
}
