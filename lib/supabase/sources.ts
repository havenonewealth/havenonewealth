"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { IncomeSource } from "@/lib/types";

function createSupabase() {
  const cookieStorePromise = cookies(); // async version

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookieStorePromise;
          return store.get(name)?.value ?? "";
        },
        async set(name: string, value: string, options: any) {
          const store = await cookieStorePromise;
          store.set(name, value, options);
        },
        async remove(name: string, options: any) {
          const store = await cookieStorePromise;
          store.set(name, "", { ...options, maxAge: 0 });
        }
      }
    }
  );
}

export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const supabase = createSupabase();

  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  return error ? [] : data ?? [];
}

export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const supabase = createSupabase();

  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .eq("deleted", false)
    .order("archived_at", { ascending: false });

  return error ? [] : data ?? [];
}
