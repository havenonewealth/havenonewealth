"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import SourceList from "@/components/sources/SourceList";
import ArchivedList from "@/components/sources/ArchivedList";
import KPI from "@/components/analytics/KPI"
import type { InsightRow } from "@/components/analytics/KPI"

// TYPES ----------------------------------------

interface IncomeSource {
  id: string;
  user_id: string;
  source_name: string;
  source_type: string;
  frequency: string;
  expected_amount: number | null;
  expected_monthly: number | null;
  notes: string | null;
  archived: boolean;
  archived_at: string | null;
  created_at: string;
}

interface SummaryInsight {
  total_expected_monthly: number | null
  total_sources: number | null
}

interface TrendRow {
  month: string;
  total: number | null;
}

// ----------------------------------------------

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FIX: Explicit types instead of never[]
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [archived, setArchived] = useState<IncomeSource[]>([]);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<TrendRow[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session || !session.user) {
        router.push("/login");
        return;
      }

      setUser(session.user);
      loadAll(session.user.id);
    };

    init();
  }, []);

  const loadAll = async (userId: string) => {
    setLoading(true);

    // Active sources
    const { data: activeRows } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", userId)
      .eq("archived", false)
      .order("created_at", { ascending: false });

    setSources(activeRows || []);

    // Archived
    const { data: archivedRows } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", userId)
      .eq("archived", true)
      .order("archived_at", { ascending: false });

    setArchived(archivedRows || []);

    // Insights
    const { data: insightsRows } = await supabase
      .from("v_user_insights")
      .select("*")
      .eq("user_id", userId);

    setInsights(insightsRows || []);

    // Trends
    const { data: trendRows } = await supabase
      .from("v_user_monthly_trends")
      .select("*")
      .eq("user_id", userId)
      .order("month");

    setMonthlyTrends(trendRows || []);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* FIX: KPI expects insights prop */}
      <KPI insights={insights} />

      <SourceList sources={sources} userId={user.id} />
      <ArchivedList archived={archived} userId={user.id} />
    </div>
  );
}
