"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function uploadAvatar(userId: string, formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  const ext = file.name.split(".").pop()
  const filePath = `${userId}/avatar.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabaseAdmin.storage
    .from("avatars")
    .upload(filePath, buffer, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("avatars")
    .getPublicUrl(filePath)

  const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

  // Update profile
  await supabaseAdmin
    .from("profiles")
    .update({ avatar_url: urlWithCacheBust })
    .eq("id", userId)

  return { url: urlWithCacheBust }
}

export async function removeAvatar(userId: string): Promise<{ error?: string }> {
  // Remove all avatar files for user
  const { data: files } = await supabaseAdmin.storage
    .from("avatars")
    .list(userId)

  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`)
    await supabaseAdmin.storage.from("avatars").remove(paths)
  }

  await supabaseAdmin
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", userId)

  return {}
}
