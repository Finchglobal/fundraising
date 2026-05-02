const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://iiqvojyxqvwvuodgomoe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'
);

async function fix() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const adminUser = users.users.find(u => u.email === 'hello@philanthroforge.com');
  
  if (adminUser) {
    const { error } = await supabase.from('profiles').update({
      role: 'super_admin',
      full_name: 'Platform Admin'
    }).eq('id', adminUser.id);
    
    if (error) {
      console.error("Error updating profile:", error);
    } else {
      console.log("Successfully updated hello@philanthroforge.com to super_admin");
    }
  } else {
    console.log("User not found.");
  }
}
fix();
