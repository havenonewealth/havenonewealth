import { supabase } from "@/lib/supabaseClient"
import { IncomeSource } from "@/lib/types"

// --------------------------------------------------
// GET ALL SOURCES FOR USER
// --------------------------------------------------
export async function getSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// --------------------------------------------------
// GET ONE SOURCE BY ID
// --------------------------------------------------
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

// --------------------------------------------------
// CREATE NEW SOURCE
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
  console.log("UPDATE PAYLOAD:", payload)

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

  console.log("UPDATE RESULT:", data)
  return data as IncomeSource
}

// --------------------------------------------------
// DELETE SOURCE
// --------------------------------------------------
export async function deleteSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("deleteSource error:", error)
    throw new Error(error.message)
  }

  return true
}
