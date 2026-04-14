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
    
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <SiteNavbar />
      <LiveActivityTicker />
      <HomepageContent
        campaigns={(campaigns as any) || []}
        featuredCampaigns={(featuredCampaigns as any) || []}
      />
      <SiteFooter />
    </main>
  )
}
