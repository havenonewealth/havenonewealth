"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// -------------------------
// Get Active Sources
// -------------------------
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

// -------------------------
// Get Archived Sources
// -------------------------
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

// -------------------------
// Save (Create / Update)
// -------------------------
export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {
  if (id) {
    const { error } = await supabase
      .from("income_sources")
      .update(payload)
      .eq("id", id)

    if (error) {
      console.error("saveSource update error:", error)
      return false
    }
    return true
  }

  const { error } = await supabase
    .from("income_sources")
    .insert(payload)

  if (error) {
    console.error("saveSource create error:", error)
    return false
  }

  return true
}

// ---------------------------------------------------------------------------
// ARCHIVE SOURCE
// ---------------------------------------------------------------------------
export async function archiveSource(id: string) {
  const { data, error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()   // <- forces Supabase to actually return updated row
    .single()

  if (error) {
    console.error("archiveSource error:", error)
    throw new Error(error.message)
  }

  return data
}

// ---------------------------------------------------------------------------
// UNARCHIVE SOURCE
// ---------------------------------------------------------------------------
export async function unarchiveSource(id: string) {
  const { data, error } = await supabase
    .from("income_sources")
    .update({
      archived: false,
      archived_at: null
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("unarchiveSource error:", error)
    throw new Error(error.message)
  }

  return data
}

