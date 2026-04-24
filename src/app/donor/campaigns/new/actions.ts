"use server"

import { createClient } from "@/lib/supabase/server"

export async function requestCampaign(data: {
  title: string
  story: string
  actual_need: number
  organization_id: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to request a campaign" }
  }

  // The database migration adds a `requested_by` column.
  const { error } = await supabase.from("campaigns").insert({
    title: data.title,
    story: data.story,
    actual_need: data.actual_need,
    organization_id: data.organization_id,
    status: "draft",
    // We are simulating the requested_by if the column is present
    requested_by: user.id
  })

  if (error) {
    console.error("Error creating campaign request:", error)
    return { error: "Failed to request campaign. Please ensure database migrations are applied." }
  }

  // Simulate automated email to the NGO
  console.log(`[EMAIL SIMULATION] To: NGO Dashboard`)
  console.log(`[EMAIL SIMULATION] Subject: New Fundraiser Request from Donor`)
  console.log(`[EMAIL SIMULATION] Body: You have a new fundraiser request titled "${data.title}". Please log in to your dashboard to review and approve it.`)

  return { success: true }
}

export async function inviteNGO(data: {
  ngoName: string
  ngoEmail: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to send an invite" }
  }

  // Simulate sending an invite email to the NGO
  console.log(`[EMAIL SIMULATION] To: ${data.ngoEmail}`)
  console.log(`[EMAIL SIMULATION] Subject: You've been invited to PhilanthroForge!`)
  console.log(`[EMAIL SIMULATION] Body: A donor has requested to create a fundraiser for ${data.ngoName}. Please register on PhilanthroForge to approve it.`)

  return { success: true }
}
