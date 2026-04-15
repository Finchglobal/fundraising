import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { MapPin, Link as LinkIcon, Sparkles, AlertCircle } from "lucide-react"
import { IconBrandInstagram, IconBrandYoutube, IconBrandX, IconBrandLinkedin, IconBrandFacebook, IconWorld } from "@tabler/icons-react"
import { NativeShare } from "@/components/ui/NativeShare"

export default async function AmbassadorPublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const supabase = await createClient()
  const { username } = await params

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("ambassador_username", username)
    .single()

  if (error || !profile) return notFound()

  // Calculate Impact
  const { data: referrals } = await supabase
    .from("donations")
    .select("amount")
    .eq("referrer_id", profile.id)
    .eq("status", "verified")

  const totalRaised = referrals?.reduce((sum, d) => sum + Number(d.amount), 0) || 0
  const totalDonations = referrals?.length || 0

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNavbar />
      
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl shadow-xl shadow-indigo-500/30 mb-6 font-bold uppercase">
            {profile.full_name?.charAt(0) || username.charAt(0)}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{profile.full_name || `@${username}`}</h1>
          <p className="text-lg text-indigo-600 font-semibold mb-6 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" /> Verified Impact Ambassador
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 mb-8">
            {profile.social_links?.instagram && (
              <a href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors">
                <IconBrandInstagram className="h-6 w-6" />
              </a>
            )}
            {profile.social_links?.youtube && (
              <a href={profile.social_links.youtube.startsWith('http') ? profile.social_links.youtube : `https://youtube.com/${profile.social_links.youtube}`} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">
                <IconBrandYoutube className="h-6 w-6" />
              </a>
            )}
            {profile.social_links?.twitter && (
              <a href={`https://twitter.com/${profile.social_links.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                <IconBrandX className="h-6 w-6" />
              </a>
            )}
            {profile.social_links?.linkedin && (
              <a href={profile.social_links.linkedin.startsWith('http') ? profile.social_links.linkedin : `https://linkedin.com/in/${profile.social_links.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors">
                <IconBrandLinkedin className="h-6 w-6" />
              </a>
            )}
            {profile.social_links?.facebook && (
              <a href={profile.social_links.facebook.startsWith('http') ? profile.social_links.facebook : `https://facebook.com/${profile.social_links.facebook}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                <IconBrandFacebook className="h-6 w-6" />
              </a>
            )}
            {profile.social_links?.website && (
              <a href={profile.social_links.website.startsWith('http') ? profile.social_links.website : `https://${profile.social_links.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors">
                <IconWorld className="h-6 w-6" />
              </a>
            )}
          </div>
          
          <div className="flex justify-center">
             <NativeShare 
                title={`${profile.full_name || username}'s Impact Profile`}
                text={`Check out the impact I've made on PhilanthroForge! Support my campaigns here:`}
                url={`https://philanthroforge.com/ambassador/${username}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-600/30 transition-all"
             />
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 -mt-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Funds Raised</div>
            <div className="text-3xl md:text-5xl font-black text-slate-900">₹{totalRaised.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Donations Mobilized</div>
            <div className="text-3xl md:text-5xl font-black text-slate-900">{totalDonations}</div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
          <AlertCircle className="h-8 w-8 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-indigo-900 mb-1">Support my campaigns</h3>
          <p className="text-sm text-indigo-700 max-w-md mx-auto">
            I am using my platform to support verified Indian charities on PhilanthroForge. Clicking my links tracks my impact!
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
