"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// Map raw DB row → strong typed object
function mapRow(row: any): IncomeSource {
  return {
    id: row.id,
    user_id: row.user_id,
    source_name: row.source_name,
    source_type: row.source_type,
    frequency: row.frequency,
    expected_amount: row.expected_amount,
    expected_monthly: row.expected_monthly,
    notes: row.notes,
    archived: row.archived,
    archived_at: row.archived_at,
    deleted: row.deleted,
    deleted_at: row.deleted_at,
    ready_for_delete: row.ready_for_delete,
    created_at: row.created_at
  }
}

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

  return (data || []).map(mapRow)
}

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

  return (data || []).map(mapRow)
}

// Create or update
export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {
  if (!payload.source_name) return false

  if (id) {
    // Update
    const { error } = await supabase
      .from("income_sources")
      .update({ ...payload })
      .eq("id", id)

    if (error) {
      console.error("saveSource update error:", error)
      return false
    }
    return true
  }

  // Create
  const { error } = await supabase
    .from("income_sources")
    .insert([{ ...payload }])

  if (error) {
    console.error("saveSource create error:", error)
    return false
  }

  return true
}

export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString(),
      deleted: false
    })
    .eq("id", id)

  if (error) {
    console.error("archiveSource error:", error)
    return false
  }
  return true
}

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
    return false
  }

  return true
}
