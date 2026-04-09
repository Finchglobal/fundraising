import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function linkOrphanedDonations() {
  console.log('🔄 Linking orphaned donations to profiles by email...')
  
  // 1. Get all donations with null donor_id
  const { data: donations } = await supabase
    .from('donations')
    .select('id, donor_email')
    .is('donor_id', null)
    .not('donor_email', 'is', null)

  if (!donations || donations.length === 0) {
    console.log('✅ No orphaned donations found.')
    return
  }

  console.log(`📡 Found ${donations.length} orphaned donations. Searching for matching profiles...`)

  let linkedCount = 0

  for (const donation of donations) {
    // 2. Search for a user with this email in auth (we check profiles table first as it's easier)
    // Actually, profiles table might not have email. Let's check auth.users via service role.
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const matchingUser = users.find(u => u.email === donation.donor_email)

    if (matchingUser) {
      const { error } = await supabase
        .from('donations')
        .update({ donor_id: matchingUser.id })
        .eq('id', donation.id)
      
      if (!error) {
        console.log(`🔗 Linked donation ${donation.id} to user ${matchingUser.email}`)
        linkedCount++
      }
    }
  }

  console.log(`\n🎉 Finished! Linked ${linkedCount} donations.`)
}

linkOrphanedDonations()
