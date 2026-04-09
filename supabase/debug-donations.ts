import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDonations() {
  console.log('🔍 Fetching all donations from database (bypassing RLS)...')
  
  const { data: donations, error } = await supabase
    .from('donations')
    .select('id, donor_name, donor_email, donor_id, amount, upi_utr, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching donations:', error)
    return
  }

  if (donations.length === 0) {
    console.log('⚠️ No donations found in the database.')
  } else {
    console.log(`✅ Found ${donations.length} total donations:`)
    console.table(donations.map(d => ({
      ...d,
      is_linked: !!d.donor_id ? 'YES' : 'NO',
      donor_id_prefix: d.donor_id ? d.donor_id.slice(0, 8) : 'NULL'
    })))
  }

  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role')
  console.log('\n👤 Active Profiles in Database:')
  console.table(profiles)
}

checkDonations()
