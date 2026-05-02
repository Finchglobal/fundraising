import { createClient } from "@/lib/supabase/server"
import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { LiveActivityTicker } from "@/components/LiveActivityTicker"
import { HomepageContent } from "@/components/HomepageContent"

export default async function LandingPage() {
  const supabase = await createClient()
  
  const { data: featuredCampaigns } = await supabase
    .from("campaigns")
    .select(`
      id,
      title,
      hero_image_url,
      public_goal,
      raised_amount,
      story,
      organization_id,
      organizations ( name, is_verified, registration_80g )
    `)
    .eq("status", "published")
    .eq("is_featured", true)
    .limit(3)

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(`
      id,
      title,
      hero_image_url,
      public_goal,
      raised_amount,
      story,
      organization_id,
      organizations ( name, is_verified, registration_80g )
    `)
    .eq("status", "published")
    .order("raised_amount", { ascending: false })
    .limit(6)

  // Fetch Global Stats
  const { data: allCampaigns } = await supabase
    .from("campaigns")
    .select("raised_amount")
    .in("status", ["published", "completed"])

  const { count: verifiedNgoCount } = await supabase
    .from("organizations")
    .select("*", { count: 'exact', head: true })
    .eq("is_verified", true)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: recentDonations } = await supabase
    .from("donations")
    .select("amount")
    .gte("created_at", startOfMonth.toISOString())
    .in("status", ["verified", "completed"])

  const totalRaised = allCampaigns?.reduce((sum, c) => sum + (Number(c.raised_amount) || 0), 0) || 0
  const raisedThisMonth = recentDonations?.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0
    
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <SiteNavbar />
      <LiveActivityTicker />
      <HomepageContent
        campaigns={(campaigns as any) || []}
        featuredCampaigns={(featuredCampaigns as any) || []}
        totalRaised={totalRaised}
        raisedThisMonth={raisedThisMonth}
        verifiedNgoCount={verifiedNgoCount || 0}
      />
      <SiteFooter />
    </main>
  )
}
