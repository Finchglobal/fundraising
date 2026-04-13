"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function adminSignUp(formData: { email: string; password: string; fullName: string; role: "donor" | "ngo_admin" }) {
  const { email, password, fullName, role } = formData

  // 1. Create the user via Admin API (bypasses rate limits and email confirmation)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (authError) {
    // If user already exists, we treat it as a success for the signup flow
    // so the frontend can proceed to log them in.
    if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
      return { success: true, email, existing: true }
    }
    return { error: authError.message }
  }

  if (authData.user) {
    // 2. Update the profile role (Default trigger might create it as donor, we ensure correct role here)
    // Wait a brief moment for the DB trigger to finish if it's there
    await new Promise(resolve => setTimeout(resolve, 500))

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role: role })
      .eq("id", authData.user.id)

    if (profileError) {
      console.error("Profile update error:", profileError)
    }

    return { success: true, email }
  }

  return { error: "Unknown error during signup" }
}
