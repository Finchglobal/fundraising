const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://iiqvojyxqvwvuodgomoe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXZvanl4cXZ3dnVvZGdvbW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDI4OSwiZXhwIjoyMDkxMDU2Mjg5fQ.tGGI-uRGgb5Uv-bHw2qmwuAYoHQTTaYQGeuoQyyWpwo'
);

async function run() {
  const { count: c_count } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });
  const { count: o_count } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
  const { count: d_count } = await supabase.from('donations').select('*', { count: 'exact', head: true });
  console.log("Campaigns:", c_count, "Orgs:", o_count, "Donations:", d_count);
}
run();
