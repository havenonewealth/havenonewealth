"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// ---------------------------------------------------------
// GET ACTIVE SOURCES
// ---------------------------------------------------------
export async function getActiveSources(userId: string) {
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

  return data
}

// ---------------------------------------------------------
// GET ARCHIVED SOURCES
// ---------------------------------------------------------
export async function getArchivedSources(userId: string) {
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

  return data
}

// ---------------------------------------------------------
// GET ONE SOURCE (for reliable editing)
// ---------------------------------------------------------
export async function getSourceById(id: string) {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("getSourceById error:", error)
    return null
  }

  return data
}

// ---------------------------------------------------------
// SAVE (CREATE OR UPDATE)
// ---------------------------------------------------------
export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {
  const safe = {
    source_name: payload.source_name,
    source_type: payload.source_type ?? null,
    frequency: payload.frequency ?? null,
    expected_amount: payload.expected_amount ?? null,
    expected_monthly: payload.expected_monthly ?? null,
    notes: payload.notes ?? null,
    user_id: payload.user_id
  }

  if (!id) {
    const { error } = await supabase.from("income_sources").insert(safe)
    if (error) {
      console.error("saveSource create error:", error)
      return false
    }
    return true
  }

  const { data, error } = await supabase
    .from("income_sources")
    .update(safe)
    .eq("id", id)
    .select()
    .single()

  console.log("UPDATE RESULT:", data, error)

  if (error) {
    console.error("saveSource update error:", error)
    return false
  }

  return true
}

// ---------------------------------------------------------
// ARCHIVE
// ---------------------------------------------------------
export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({ archived: true, archived_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  return true
}

// ---------------------------------------------------------
// UNARCHIVE
// ---------------------------------------------------------
export async function unarchiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({ archived: false, archived_at: null })
    .eq("id", id)

  if (error) throw new Error(error.message)
  return true
}
