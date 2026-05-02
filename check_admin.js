const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://iiqvojyxqvwvuodgomoe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'
);

async function check() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const existing = users.users.find(u => u.email === 'hello@philanthroforge.com');
  if (existing) {
    console.log("Admin exists. Checking profile...");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', existing.id).single();
    console.log("Profile role:", profile?.role);
  } else {
    console.log("Admin does not exist.");
  }
}
check();
