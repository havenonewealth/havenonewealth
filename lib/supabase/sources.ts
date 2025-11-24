"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

function sanitize(data: any) {
  const cleaned: any = {}
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue
    if (v === "") cleaned[k] = null
    else cleaned[k] = v
  }
  return cleaned
}

const numericFix = (val: any) => {
  if (val === null || val === undefined) return null
  if (typeof val === "number") return val
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "")
    return cleaned === "" ? null : Number(cleaned)
  }
  return val
}

export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("deleted", false)
    .order("created_at", { ascending: false })

  if (error) return []
  return data as IncomeSource[]
}

export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .eq("deleted", false)
    .order("archived_at", { ascending: false })

  if (error) return []
  return data as IncomeSource[]
}

export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {
  const safe = sanitize({
    source_name: payload.source_name?.trim(),
    source_type: payload.source_type ?? null,
    frequency: payload.frequency ?? null,
    expected_amount: numericFix(payload.expected_amount),
    expected_monthly: numericFix(payload.expected_monthly),
    notes: payload.notes ?? null,
    user_id: payload.user_id
  })

  if (id) {
    const { id: _skip, user_id: _skip2, ...fields } = safe

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

  const { error } = await supabase
    .from("income_sources")
    .insert(safe)

  if (error) {
    console.error("saveSource CREATE ERROR:", error)
    return false
  }

  return true
}

export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
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

  if (error) throw new Error(error.message)
  return true
}
