"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft, Mail, AlertCircle, Quote } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<"password" | "magic-link">("password")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === "password") {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        const role = profile?.role || "donor"
        if (role === "super_admin") router.push("/admin")
        else if (role === "ngo_admin") router.push("/dashboard")
        else router.push("/donor")
      }
    } else {
      // Magic Link Login
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message)
      } else {
        setSuccess("Check your email for the magic link to sign in!")
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white md:flex">
      {/* Left split: Image and Trust Signal (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative bg-gray-950 overflow-hidden text-white flex-col justify-between">
        <Image
          src="/login-bg.png"
          alt="Community Impact"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
        
        <div className="relative z-10 p-12 lg:p-20 pt-16 flex-1 flex flex-col justify-between">
          <div>
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image src="/logo.svg" alt="PhilanthroForge" width={200} height={80} className="h-12 w-auto brightness-0 invert" />
            </Link>
          </div>
          
          <div className="max-w-xl pb-10">
            <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight tracking-tight">
              Fundraise with Trust.<br />
              <span className="text-green-400">Empower Communities.</span>
            </h1>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl">
              <Quote className="h-8 w-8 text-green-400 mb-4 opacity-50" />
              <p className="text-lg text-gray-200 font-medium leading-relaxed">
                "PhilanthroForge helps us focus entirely on our mission. The transparent platform handles the receipts, the AI helps with updates, and donors finally have a platform they trust implicitly."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-white shadow-xl shadow-green-500/20">
                  RV
                </div>
                <div>
                  <div className="font-bold text-sm">Rahul Verma</div>
                  <div className="text-xs text-gray-400">Director, Rural Health Initiative</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right split: Login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24 bg-white dark:bg-gray-950 relative">
        <Link href="/" className="absolute top-8 left-6 md:hidden">
          <Image src="/logo.svg" alt="PhilanthroForge" width={150} height={50} className="h-8 w-auto dark:invert" />
        </Link>
        <Link href="/" className="absolute top-8 right-8 flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="mx-auto w-full max-w-sm mt-12 md:mt-0">
          <div className="text-center md:text-left mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-xl mb-6">
              <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">Log in to manage your verified campaigns.</p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl flex items-center mb-8">
            <button 
              onClick={() => { setMode("password"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === "password" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
            >
              Password
            </button>
            <button 
              onClick={() => { setMode("magic-link"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === "magic-link" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
            >
              Magic Link
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />
                <p>{success}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@ngo.org"
                className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-medium text-gray-900 dark:text-white"
              />
            </div>

            {mode === "password" && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-medium text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {mode === "password" ? "Signing in..." : "Sending Link..."}</>
              ) : (
                mode === "password" ? "Sign In" : <><Mail className="h-4 w-4" /> Send Magic Link</>
              )}
            </button>
          </form>

          {/* Quick fill demo credentials */}
          <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></span>
              Demo Access
              <span className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></span>
            </p>
            <div className="space-y-2">
              {[
                { label: "Super Admin", email: "admin@philanthroforge.com", pw: "PF@Admin2025!" },
                { label: "NGO Admin", email: "ngo@bmat.org", pw: "NGO@Demo2025!" },
              ].map(cred => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() => { setMode("password"); setEmail(cred.email); setPassword(cred.pw) }}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-green-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-500/50 rounded-xl transition-all flex justify-between items-center group"
                >
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-200">{cred.label}</div>
                    <div className="text-xs text-gray-500 font-medium">{cred.email}</div>
                  </div>
                  <div className="text-xs font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Autofill →
                  </div>
                </button>
              ))}
            </div>
            
            <p className="text-center text-sm font-medium text-gray-500 mt-8">
              Want to support a cause?{" "}
              <Link href="/#campaigns" className="text-green-600 hover:text-green-700 font-bold hover:underline underline-offset-4">
                Donate without an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
