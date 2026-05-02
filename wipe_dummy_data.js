const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://iiqvojyxqvwvuodgomoe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'
);

async function wipe() {
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
  if (err1) {
    console.error("Error listing users:", err1);
    return;
  }
  
  for (const u of users.users) {
    if (u.email !== 'admin@philanthroforge.com') {
      const { error } = await supabase.auth.admin.deleteUser(u.id);
      if (error) {
         console.error("Error deleting user:", u.email, error);
      } else {
         console.log("Deleted user:", u.email);
      }
    }
  }
  console.log("Done wiping users.");
}
wipe();
