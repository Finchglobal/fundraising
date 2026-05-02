const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://iiqvojyxqvwvuodgomoe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'
);

async function setup() {
  // Create or update the new admin user
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: 'hello@philanthroforge.com',
    password: '72099Sh@',
    email_confirm: true
  });

  if (createError && !createError.message.includes('already registered')) {
    console.error("Error creating new admin:", createError);
  } else {
    // If it exists, update password
    if (createError?.message.includes('already registered')) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users.users.find(u => u.email === 'hello@philanthroforge.com');
      if (existing) {
        await supabase.auth.admin.updateUserById(existing.id, { password: '72099Sh@' });
        console.log("Updated password for existing hello@philanthroforge.com");
      }
    } else if (user?.user) {
      console.log("Created hello@philanthroforge.com");
      // Set role in profiles
      await supabase.from('profiles').upsert({
        id: user.user.id,
        role: 'super_admin',
        full_name: 'Super Admin',
        email: 'hello@philanthroforge.com',
        onboarding_completed: true
      });
      console.log("Profile set to super_admin");
    }
  }

  // Delete the old admin if it exists
  const { data: users } = await supabase.auth.admin.listUsers();
  const oldAdmin = users.users.find(u => u.email === 'admin@philanthroforge.com');
  if (oldAdmin) {
    await supabase.auth.admin.deleteUser(oldAdmin.id);
    console.log("Deleted old admin@philanthroforge.com");
  }

}
setup();
