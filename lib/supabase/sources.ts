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
export async function saveSource(
  id: string | null,
  payload: Partial<IncomeSource>
) {
  // Only the editable business fields
  const base = {
    source_name: payload.source_name,
    source_type: payload.source_type ?? null,
    frequency: payload.frequency ?? null,
    expected_amount: payload.expected_amount ?? null,
    expected_monthly: payload.expected_monthly ?? null,
    notes: payload.notes ?? null
  }

  // CREATE
  if (!id) {
    const insertPayload = {
      ...base,
      user_id: payload.user_id
    }

    const { error } = await supabase
      .from("income_sources")
      .insert(insertPayload)

    if (error) {
      console.error("saveSource create error:", error)
      return false
    }

    return true
  }

  // UPDATE (do NOT touch user_id / archived / deleted flags here)
  const { error } = await supabase
    .from("income_sources")
    .update(base)
    .eq("id", id)

  if (error) {
    console.error("saveSource update error:", error)
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
