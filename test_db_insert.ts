import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iiqvojyxqvwvuodgomoe.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function test() {
  const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
  if (!orgs || orgs.length === 0) return
  const orgId = orgs[0].id
  console.log("Using Org ID:", orgId)

  const campaignData = {
      organization_id: orgId,
      title: "Test Draft Title",
      story: "Draft campaign story...",
      hero_image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
      video_url: "",
      media_gallery: [],
      actual_need: 0,
      platform_buffer: 0,
      public_goal: 0,
      status: "draft",
      raised_amount: 0,
      is_featured: false
  }
  const { data, error } = await supabase.from('campaigns').insert(campaignData).select()
  console.log("Result:", data, "Error:", error)
}
test()
