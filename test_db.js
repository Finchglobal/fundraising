const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://iiqvojyxqvwvuodgomoe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'
);

async function run() {
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
  console.log("Users count:", users?.users?.length, "Error:", err1);
  
  const { data: tables, error: err2 } = await supabase.from('donations').select('status, created_at, amount').limit(5);
  console.log("Donations:", tables, "Error:", err2);
}
run();
