"use server"

import { supabase } from "@/lib/supabaseClient"
import { IncomeSource } from "@/lib/types"

// --------------------------------------------------
// GET ACTIVE SOURCES
// --------------------------------------------------
export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getActiveSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// --------------------------------------------------
// GET ARCHIVED SOURCES
// --------------------------------------------------
export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .order("archived_at", { ascending: false })

  if (error) {
    console.error("getArchivedSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// --------------------------------------------------
// CREATE SOURCE
// --------------------------------------------------
export async function createSource(payload: Partial<IncomeSource>) {
  const { data, error } = await supabase
    .from("income_sources")
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error("createSource error:", error)
    throw new Error(error.message)
  }

  return data as IncomeSource
}

// --------------------------------------------------
// UPDATE SOURCE
// --------------------------------------------------
export async function updateSource(id: string, payload: Partial<IncomeSource>) {
  const { data, error } = await supabase
    .from("income_sources")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("updateSource error:", error)
    throw new Error(error.message)
  }

  return data as IncomeSource
}

// --------------------------------------------------
// ARCHIVE SOURCE
// --------------------------------------------------
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
}

// --------------------------------------------------
// UNARCHIVE SOURCE
// --------------------------------------------------
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
}
