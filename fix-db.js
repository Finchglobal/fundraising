const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function fix() {
  const orgId = 'dd24a6e8-ffdf-4cf8-9465-862deb4e68be'; // tax deductable test
  const userId = 'd299eea2-57f1-48d1-be54-fd8b07e80099'; // donor@example.com

  await supabase.from('profiles').update({ role: 'donor', organization_id: null }).eq('id', userId);
  await supabase.from('organizations').delete().eq('id', orgId);
  console.log("Fixed!");
}
fix();
