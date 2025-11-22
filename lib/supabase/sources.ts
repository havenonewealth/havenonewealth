"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// ---------------------------------------------------------
// ACTIVE SOURCES
// ---------------------------------------------------------
export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("deleted", false)

  if (error) {
    console.error("getActiveSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// ---------------------------------------------------------
// ARCHIVED SOURCES
// ---------------------------------------------------------
export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .eq("deleted", false)

  if (error) {
    console.error("getArchivedSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// ---------------------------------------------------------
// SAVE SOURCE (CREATE / UPDATE) — FIXED
// ---------------------------------------------------------
export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {
  console.log("SAVESOURCE: called with id =", id)
  console.log("SAVESOURCE: payload =", payload)

  if (id) {
    const { error, data } = await supabase
      .from("income_sources")
      .update(payload)
      .eq("id", id)
      .select()

    console.log("SAVESOURCE: UPDATE RESULT =", { error, data })

    if (error) return false
    return true
  }

  const { error, data } = await supabase
    .from("income_sources")
    .insert(payload)
    .select()

  console.log("SAVESOURCE: INSERT RESULT =", { error, data })

  if (error) return false
  return true
}

// ---------------------------------------------------------
// ARCHIVE SOURCE — WORKING
// ---------------------------------------------------------
export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("archiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}

// ---------------------------------------------------------
// UNARCHIVE SOURCE — WORKING
// ---------------------------------------------------------
export async function unarchiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: false,
      archived_at: null
    })
    .eq("id", id)

  if (error) {
    console.error("unarchiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}
