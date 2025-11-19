"use server"

import { supabase } from "@/lib/supabaseClient"
import { IncomeSource } from "@/lib/types"

/* =====================================================
   GET ACTIVE (NON-ARCHIVED) SOURCES
   ===================================================== */
export async function getSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

/* =====================================================
   GET ARCHIVED SOURCES
   ===================================================== */
export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getArchivedSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

/* =====================================================
   GET ONE SOURCE
   ===================================================== */
export async function getSourceById(id: string): Promise<IncomeSource | null> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("getSourceById error:", error)
    return null
  }

  return data as IncomeSource
}

/* =====================================================
   CREATE SOURCE
   ===================================================== */
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

/* =====================================================
   UPDATE SOURCE
   ===================================================== */
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

/* =====================================================
   ARCHIVE (SOFT-DELETE)
   ===================================================== */
export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({ archived: true })
    .eq("id", id)

  if (error) {
    console.error("archiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}

/* =====================================================
   RESTORE ARCHIVED SOURCE
   ===================================================== */
export async function restoreSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({ archived: false })
    .eq("id", id)

  if (error) {
    console.error("restoreSource error:", error)
    throw new Error(error.message)
  }

  return true
}
