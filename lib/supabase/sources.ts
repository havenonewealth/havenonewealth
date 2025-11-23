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
    .order("created_at", { ascending: false })

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
    .order("archived_at", { ascending: false })

  if (error) {
    console.error("getArchivedSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// ---------------------------------------------------------
// SAVE SOURCE (CREATE / UPDATE)
// ---------------------------------------------------------
// ---------------------------------------------------------
// SAVE SOURCE (FIXED: prevent user_id from being updated)
// ---------------------------------------------------------
export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {

  if (id) {
    // REMOVE user_id and id so they are NOT updated
    const { user_id, id: _ignored, ...updateFields } = payload

    const { error } = await supabase
      .from("income_sources")
      .update(updateFields)
      .eq("id", id)

    if (error) {
      console.error("saveSource update error:", error)
      return false
    }

    return true
  }

  // CREATE (user_id is allowed on creation)
  const { error } = await supabase
    .from("income_sources")
    .insert(payload)

  if (error) {
    console.error("saveSource create error:", error)
    return false
  }

  return true
}

// ---------------------------------------------------------
// ARCHIVE SOURCE
// ---------------------------------------------------------
export async function archiveSource(id: string) {
  console.log("ARCHIVE: updating source", id)

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
// UNARCHIVE SOURCE
// ---------------------------------------------------------
export async function unarchiveSource(id: string) {
  console.log("UNARCHIVE: updating source", id)

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
