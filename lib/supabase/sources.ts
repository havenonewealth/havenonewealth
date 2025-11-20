"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

export type SourcePayload = {
  user_id: string
  source_name: string
  source_type: string | null
  frequency: string | null
  expected_amount: number | null
  expected_monthly: number | null
  notes: string | null
}

// ------------------------------------------------------------
// GET ACTIVE SOURCES
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// GET ARCHIVED SOURCES
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// CREATE or UPDATE SOURCE
// ------------------------------------------------------------
export async function saveSource(id: string | null, payload: SourcePayload) {
  if (id) {
    // UPDATE
    const { data, error } = await supabase
      .from("income_sources")
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("saveSource update error:", error)
      throw new Error(error.message)
    }

    return data
  } else {
    // CREATE NEW
    const { data, error } = await supabase
      .from("income_sources")
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error("saveSource create error:", error)
      throw new Error(error.message)
    }

    return data
  }
}

// ------------------------------------------------------------
// ARCHIVE SOURCE
// ------------------------------------------------------------
export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("archiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}

// ------------------------------------------------------------
// UNARCHIVE SOURCE
// ------------------------------------------------------------
export async function unarchiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: false,
      archived_at: null,
    })
    .eq("id", id)

  if (error) {
    console.error("unarchiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}
