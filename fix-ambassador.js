const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function fix() {
  await supabase.from('profiles').update({ is_ambassador: true, ambassador_username: 'donor1_ambassador' }).eq('id', '9d257409-29f4-4fcf-9c78-095bea4dc83f');
  console.log("Fixed ambassador!");
}
fix();
