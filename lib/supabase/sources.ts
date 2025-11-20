"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// Fetch active sources
export async function getActiveSources(userId: string) {
  const { data } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("deleted", false)

  return data ?? []
}

// Fetch archived sources
export async function getArchivedSources(userId: string) {
  const { data } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .eq("deleted", false)

  return data ?? []
}


// Save or update source
export async function saveSource(payload: any) {
  if (payload.id) {
    await supabase
      .from("income_sources")
      .update(payload)
      .eq("id", payload.id)
  } else {
    await supabase.from("income_sources").insert(payload)
  }

  return true
}

// Archive
export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString(),
      deleted: false,
      deleted_at: null,
      ready_for_delete: false
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

// Unarchive
export async function unarchiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: false,
      archived_at: null,
      deleted: false,
      deleted_at: null
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

