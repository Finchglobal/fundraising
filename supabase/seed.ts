import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Please provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const ngos = [
  {
    name: "Bangalore Medical Aid Trust",
    description: "Providing critical medical interventions and post-op care for underprivileged families in Karnataka.",
    pan_number: "BLRMA1234T",
    registration_number: "TRUST-BLR-2005",
    upi_id: "bmatrust@sbi",
    logo_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
    is_verified: true,
  },
  {
    name: "Rural Girls Education Foundation",
    description: "Bridging the education gap for girls in rural Rajasthan through scholarships and school supplies.",
    pan_number: "RGEF9876E",
    registration_number: "TRUST-RAJ-2012",
    upi_id: "rgef@icici",
    logo_url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&q=80",
    is_verified: true,
  },
  {
    name: "Lucknow Dialysis Support Initiative",
    description: "Offering subsidized and free dialysis sessions to end-stage renal disease patients.",
    pan_number: "LKO9988D",
    registration_number: "SOCIETY-UP-2018",
    upi_id: "lkodialysis@hdfc",
    logo_url: "https://images.unsplash.com/photo-1551076805-e1869043e560?w=400&q=80",
    is_verified: true,
  },
  {
    name: "Mumbai Animal Rescue Co.",
    description: "Rescuing and rehabilitating stray animals in Mumbai.",
    pan_number: "MUMARC8876",
    registration_number: "NGO-MH-2015",
    upi_id: "mumrescue@yesbank",
    logo_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80",
    is_verified: true,
  }
];

const campaignsData = [
  {
    ngoIndex: 0,
    title: "Support 8-year-old Aarav's Heart Surgery",
    story: "Aarav needs an urgent congenital heart defect surgery. His father, a daily wage laborer, cannot afford the ₹3,00,000 cost. Please help give Aarav a second chance at life.",
    hero_image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
    actual_need: 300000,
  },
  {
    ngoIndex: 0,
    title: "Post-Op Care for 15 Pediatric Patients",
    story: "We have 15 children recovering from major surgeries who need prolonged ICU care. Your support will cover their hospital stay and medications.",
    hero_image_url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&q=80",
    actual_need: 500000,
  },
  {
    ngoIndex: 1,
    title: "Sponsor Education for 50 Girls in Jaipur",
    story: "With ₹2,000, you can cover a girl's tuition and books for an entire year. Our goal is to secure the education of 50 bright young minds this academic year.",
    hero_image_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    actual_need: 100000,
  },
  {
    ngoIndex: 1,
    title: "Build a Science Lab for Village School",
    story: "Practical education is missing in many rural areas. Help us setup a modern science lab to spark the curiosity of over 300 students.",
    hero_image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
    actual_need: 450000,
  },
  {
    ngoIndex: 2,
    title: "Fund 100 Dialysis Sessions in Lucknow",
    story: "Chronic kidney disease drains families emotionally and financially. Help us sponsor 100 dialysis sessions for the most vulnerable patients in Lucknow.",
    hero_image_url: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&q=80",
    actual_need: 250000,
  },
  {
    ngoIndex: 2,
    title: "Medicines for 30 Rural Kidney Patients",
    story: "Besides dialysis, patients need regular medicines which they cannot afford. Let's ensure continuous care for 30 patients for 6 months.",
    hero_image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80",
    actual_need: 150000,
  },
  {
    ngoIndex: 3,
    title: "Provide Winter Shelters for Stray Dogs",
    story: "Winter is harsh on the streets of Mumbai. We are building 50 portable wooden shelters to keep injured and young stray dogs warm.",
    hero_image_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
    actual_need: 75000,
  },
  {
    ngoIndex: 3,
    title: "Vaccination Drive for 500 Stray Animals",
    story: "To prevent the spread of rabies and other deadly diseases, we are organizing a massive vaccination and sterilization drive in suburban areas.",
    hero_image_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80",
    actual_need: 200000,
  }
];

const indianNames = ["Aditi Sharma", "Rahul Verma", "Sneha Patel", "Vikram Singh", "Pooja Desai", "Karan Malhotra", "Riya Gupta", "Arjun Reddy", "Neha Kapoor", "Rohan Iyer", "Anita Kumar", "Deepak Rao", "Sunita Nair", "Suresh Menon", "Kavita Joshi", "Ajay Kadam", "Ravi Pillai"];

function generateRandomDonations(campaignId: string, count: number) {
  const donations = [];
  for (let i = 0; i < count; i++) {
    const isAnonymous = Math.random() > 0.7;
    const name = indianNames[Math.floor(Math.random() * indianNames.length)];
    const amount = Math.floor(Math.random() * 50) * 100 + 500; // Between 500 and 5500
    const tip = Math.floor(amount * 0.05);
    const utr = `UPI${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`;
    const statuses = ['pending', 'verified', 'verified', 'verified']; // 75% chance of being verified
    
    donations.push({
      campaign_id: campaignId,
      donor_name: name,
      donor_email: `${name.replace(' ', '').toLowerCase()}@example.com`,
      is_anonymous: isAnonymous,
      amount: amount,
      platform_tip: tip,
      upi_utr: utr,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  return donations;
}

async function runSeed() {
  console.log("Seeding database...")

  // 1. Insert NGOs
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert(ngos)
    .select()

  if (orgError) {
    console.error("Error inserting NGOs:", orgError)
    return
  }
  
  console.log(`Inserted ${orgData.length} NGOs.`)

  // 2. Insert Campaigns
  const campaignsToInsert = campaignsData.map(c => {
    const orgId = orgData[c.ngoIndex].id
    const buffer = c.actual_need * 0.02
    const publicGoal = c.actual_need + buffer
    return {
      organization_id: orgId,
      title: c.title,
      story: c.story,
      hero_image_url: c.hero_image_url,
      actual_need: c.actual_need,
      platform_buffer: buffer,
      public_goal: publicGoal,
      status: 'published'
    }
  })

  const { data: capData, error: capError } = await supabase
    .from('campaigns')
    .insert(campaignsToInsert)
    .select()

  if (capError) {
    console.error("Error inserting campaigns:", capError)
    return
  }

  console.log(`Inserted ${capData.length} Campaigns.`)

  // 3. Insert Donations
  let allDonations = [];
  for (const campaign of capData) {
    const numDonations = Math.floor(Math.random() * 10) + 5; // 5 to 15 donations per campaign
    const campaignDonations = generateRandomDonations(campaign.id, numDonations);
    allDonations = allDonations.concat(campaignDonations);
    
    // Calculate total verified raised amount
    const verifiedRaised = campaignDonations
      .filter(d => d.status === 'verified')
      .reduce((sum, d) => sum + d.amount, 0);

    // Update campaign raised amount
    await supabase
      .from('campaigns')
      .update({ raised_amount: verifiedRaised })
      .eq('id', campaign.id);
  }

  const { data: donData, error: donError } = await supabase
    .from('donations')
    .insert(allDonations)
    .select()

  if (donError) {
    console.error("Error inserting donations:", donError)
    return
  }

  console.log(`Inserted ${donData.length} Donations. Seed complete!`)
}

runSeed()
