"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveCampaignRequest(campaignId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("campaigns")
    .update({ status: "published" })
    .eq("id", campaignId)

  if (error) {
    console.error("Failed to approve campaign", error)
    return { error: "Failed to approve campaign." }
  }

  // Simulate sending an email to the donor
  console.log(`[EMAIL SIMULATION] To: Donor`)
  console.log(`[EMAIL SIMULATION] Subject: Your Fundraiser Request was Approved!`)
  console.log(`[EMAIL SIMULATION] Body: The Nonprofit has approved your campaign request. It is now live on the platform.`)

  revalidatePath("/dashboard/requests")
  return { success: true }
}

export async function rejectCampaignRequest(campaignId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", campaignId)

  if (error) {
    console.error("Failed to reject campaign", error)
    return { error: "Failed to reject campaign." }
  }

  // Simulate sending an email to the donor
  console.log(`[EMAIL SIMULATION] To: Donor`)
  console.log(`[EMAIL SIMULATION] Subject: Update on your Fundraiser Request`)
  console.log(`[EMAIL SIMULATION] Body: The Nonprofit has declined your campaign request at this time.`)

  revalidatePath("/dashboard/requests")
  return { success: true }
}
