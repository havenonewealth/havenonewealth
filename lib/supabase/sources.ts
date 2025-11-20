"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// ----------------------------------------------------------------------------
// FETCH ACTIVE SOURCES
// ----------------------------------------------------------------------------
export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .eq("deleted", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getActiveSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// ----------------------------------------------------------------------------
// FETCH ARCHIVED SOURCES
// ----------------------------------------------------------------------------
export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .not("archived_at", "is", null)
    .eq("deleted", false)
    .order("archived_at", { ascending: false })

  if (error) {
    console.error("getArchivedSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// ----------------------------------------------------------------------------
// SAVE SOURCE (create or update)
// ----------------------------------------------------------------------------
export async function saveSource(
  userId: string,
  id: string | null,
  payload: Partial<IncomeSource>
) {
  if (id) {
    // UPDATE
    const { error } = await supabase
      .from("income_sources")
      .update({
        ...payload,
        user_id: userId
      })
      .eq("id", id)

    if (error) {
      console.error("saveSource update error:", error)
      throw new Error(error.message)
    }

    return true
  }

  // CREATE
  const { error } = await supabase
    .from("income_sources")
    .insert({
      ...payload,
      user_id: userId,
      deleted: false,
      archived_at: null
    })

  if (error) {
    console.error("saveSource insert error:", error)
    throw new Error(error.message)
  }

  return true
}

// ----------------------------------------------------------------------------
// ARCHIVE SOURCE
// ----------------------------------------------------------------------------
export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived_at: new Date().toISOString(),
      deleted: false
    })
    .eq("id", id)

  if (error) {
    console.error("archiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}

// ----------------------------------------------------------------------------
// UNARCHIVE SOURCE
// ----------------------------------------------------------------------------
export async function unarchiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived_at: null,
      deleted: false
    })
    .eq("id", id)

  if (error) {
    console.error("unarchiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}

// ----------------------------------------------------------------------------
// HARD DELETE (optional)
// ----------------------------------------------------------------------------
export async function hardDeleteSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      deleted: true,
      archived_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("hardDeleteSource error:", error)
    throw new Error(error.message)
  }

  return true
}
