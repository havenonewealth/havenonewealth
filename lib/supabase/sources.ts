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
// SAVE SOURCE (with strict debugging)
// ---------------------------------------------------------
export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {
  console.log("SAVESOURCE: called with id =", id)
  console.log("SAVESOURCE: payload =", payload)

  const safePayload = {
    source_name: payload.source_name ?? null,
    source_type: payload.source_type ?? null,
    frequency: payload.frequency ?? null,
    expected_amount: payload.expected_amount ?? null,
    expected_monthly: payload.expected_monthly ?? null,
    notes: payload.notes ?? null,
    user_id: payload.user_id
  }

  // UPDATE
  if (id) {
    console.log("SAVESOURCE: running UPDATE for id =", id)

    console.log("UPSERT PAYLOAD:", safePayload);

    const { data, error } = await supabase
      .from("income_sources")
      .update(safePayload)
      .eq("id", id)
      .select();

    console.log("UPSERT RESULT:", data, "ERROR:", error);

    console.log("SAVESOURCE: update RESULT =", data)

    if (error) {
      console.error("saveSource UPDATE failed:", error)
      return false
    }

    if (!data || data.length === 0) {
      console.error("saveSource UPDATE returned 0 rows — ID mismatch")
      return false
    }

    return true
  }

  // INSERT
  console.log("SAVESOURCE: running INSERT")

  const { data, error } = await supabase
    .from("income_sources")
    .insert(safePayload)
    .select()

  console.log("SAVESOURCE: insert RESULT =", data)
  console.log("SAVESOURCE: insert ERROR =", error)

  if (error) {
    console.error("saveSource INSERT failed:", error)
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
