import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iiqvojyxqvwvuodgomoe.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const TEST_USERS = [
  {
    email: 'admin@philanthroforge.com',
    password: 'PF@Admin2025!',
    role: 'super_admin',
    full_name: 'Platform Administrator'
  },
  {
    email: 'ngo@bmat.org',
    password: 'NGO@Demo2025!',
    role: 'ngo_admin',
    full_name: 'Bangalore Medical Aid Trust',
    organization_id: '3326759e-b8d4-4bb3-accb-8ab2d9cd7ea1' // Bangalore Medical Aid Trust
  },
  {
    email: 'ngo@rgef.org',
    password: 'NGO@Demo2025!',
    role: 'ngo_admin',
    full_name: 'Rural Girls Education Foundation',
    organization_id: '3326759e-b8d4-4bb3-accb-8ab2d9cd7ea2' // Rural Girls Education Foundation
  },
  {
    email: 'donor@example.com',
    password: 'Donor@Demo2025!',
    role: 'donor',
    full_name: 'Regular Impact Donor'
  }
]

async function createTestUsers() {
  console.log('🔑 Creating test users...\n')
  
  for (const user of TEST_USERS) {
    // Create auth user - use admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name, role: user.role }
    })

    let userId = authData.user?.id

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`⚠️  ${user.email} already exists, updating role/organization...`)
        // Find existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === user.email)
        if (existingUser) {
          userId = existingUser.id
        }
      } else {
        console.error(`❌ Error creating ${user.email}:`, authError.message)
        continue
      }
    }

    if (userId) {
      // Update or insert profile with role and organization_id
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: user.full_name,
        role: user.role,
        organization_id: (user as any).organization_id || null
      })
      
      if (profileError) {
        console.error(`❌ Profile error for ${user.email}:`, profileError.message)
      } else {
        const orgSuffix = (user as any).organization_id ? ` | Org Linked` : ''
        console.log(`✅ Ready: ${user.email} | Role: ${user.role}${orgSuffix}`)
      }
    }
  }

  console.log('\n🎉 Test user setup complete!')
  console.log('\n📋 Credentials Summary:')
  console.log('─────────────────────────────────────────────')
  for (const u of TEST_USERS) {
    console.log(`${u.role.padEnd(15)} | ${u.email.padEnd(30)} | ${u.password}`)
  }
  console.log('─────────────────────────────────────────────')
  console.log('Donors use guest checkout — no login required.')
}

createTestUsers()
