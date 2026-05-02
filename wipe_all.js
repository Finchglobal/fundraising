const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://iiqvojyxqvwvuodgomoe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'
);

async function wipeAll() {
  await supabase.from('donations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Deleted data from tables");
}
wipeAll();
