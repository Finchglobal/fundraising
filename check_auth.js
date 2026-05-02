const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://iiqvojyxqvwvuodgomoe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'
);

async function check() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const existing = users.users.find(u => u.email === 'hello@philanthroforge.com');
  console.log("Email confirmed at:", existing.email_confirmed_at);
  
  // Force update password and confirm email just in case
  const { error } = await supabase.auth.admin.updateUserById(existing.id, { 
    password: '72099Sh@',
    email_confirm: true 
  });
  if (error) console.error(error);
  else console.log("Password and email confirmation forcefully reset.");
}
check();
