"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// ---------------------------------------------------------
// CLEANER — removes undefined, converts empty string → null
// ---------------------------------------------------------
function sanitize(data: any) {
  const cleaned: any = {}

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue     // skip undefined
    if (value === "") cleaned[key] = null // empty strings become null
    else cleaned[key] = value
  }

  return cleaned
}

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
// SAVE SOURCE (CREATE + UPDATE)
// FIXED: removes undefined, strips formatted currency, prevents failed updates
// ---------------------------------------------------------
export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {
  console.log("saveSource INPUT:", id, payload)

  // Convert formatted values like "$100.00" to 100
  const numericFix = (val: any) => {
    if (val === null || val === undefined) return null
    if (typeof val === "number") return val
    if (typeof val === "string") {
      const cleaned = val.replace(/[^0-9.-]/g, "")
      return cleaned === "" ? null : Number(cleaned)
    }
    return val
  }

  const safe = sanitize({
    source_name: payload.source_name?.trim(),
    source_type: payload.source_type ?? null,
    frequency: payload.frequency ?? null,
    expected_amount: numericFix(payload.expected_amount),
    expected_monthly: numericFix(payload.expected_monthly),
    notes: payload.notes ?? null,
    user_id: payload.user_id
  })

  console.log("saveSource CLEANED payload:", safe)

  if (id) {
    // must not update id or user_id
    const { id: _ignore, user_id: _ignore2, ...fields } = safe

    const { error } = await supabase
      .from("income_sources")
      .update(fields)
      .eq("id", id)

    if (error) {
      console.error("saveSource UPDATE ERROR:", error)
      return false
    }

    return true
  }

  // CREATE
  const { error } = await supabase
    .from("income_sources")
    .insert(safe)

  if (error) {
    console.error("saveSource CREATE ERROR:", error)
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
