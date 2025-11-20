"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// ---------------------------------------------------------------------------
// ACTIVE SOURCES (not archived & not deleted)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// ARCHIVED SOURCES
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// CREATE OR UPDATE SOURCE
// ---------------------------------------------------------------------------
export async function saveSource(values: Partial<IncomeSource>, id?: string) {
  if (id) {
    // UPDATE
    const { data, error } = await supabase
      .from("income_sources")
      .update(values)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  // INSERT
  const { data, error } = await supabase
    .from("income_sources")
    .insert(values)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ---------------------------------------------------------------------------
// ARCHIVE
// ---------------------------------------------------------------------------
export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// UNARCHIVE
// ---------------------------------------------------------------------------
export async function unarchiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: false,
      archived_at: null
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// SOFT DELETE (mark for purge)
// ---------------------------------------------------------------------------
export async function softDeleteSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      deleted: true,
      deleted_at: new Date().toISOString(),
      ready_for_delete: true
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
}
