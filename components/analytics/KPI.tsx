"use client";

export interface InsightRow {
  source_name: string;
  total_earned: number | string;
  avg_payment: number | string;
  payout_count: number | string;
  first_payment: string | null;
  last_payment: string | null;
}

interface KPIProps {
  insights: InsightRow[];
}

export default function KPI({ insights }: KPIProps) {
  if (!insights || insights.length === 0) {
    return <p className="text-gray-500">No insight data available.</p>;
  }

  // Normalize number fields (Supabase returns numeric columns as strings)
  const normalized = insights.map((i) => ({
    ...i,
    total_earned: Number(i.total_earned) || 0,
    avg_payment: Number(i.avg_payment) || 0,
    payout_count: Number(i.payout_count) || 0,
  }));

  const totalEarned = normalized.reduce(
    (sum, i) => sum + i.total_earned,
    0
  );

  const totalPayments = normalized.reduce(
    (sum, i) => sum + i.payout_count,
    0
  );

  const avgPayment =
    normalized.reduce((sum, i) => sum + i.avg_payment, 0) /
    normalized.length;

  const highestSource = normalized.reduce((max, row) =>
    row.total_earned > max.total_earned ? row : max
  );

  const firstPaymentDate = normalized
    .map((i) => i.first_payment)
    .filter(Boolean)
    .sort()[0];

  const lastPaymentDate = normalized
    .map((i) => i.last_payment)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  const formatter = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

  const items = [
    { label: "Total Earned", value: formatter(totalEarned) },
    { label: "Average Payment", value: formatter(avgPayment || 0) },
    { label: "Total Payments", value: totalPayments },
    { label: "Top Source", value: highestSource.source_name },
    {
      label: "First Payment",
      value: firstPaymentDate
        ? new Date(firstPaymentDate).toLocaleDateString()
        : "—",
    },
    {
      label: "Last Payment",
      value: lastPaymentDate
        ? new Date(lastPaymentDate).toLocaleDateString()
        : "—",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="border rounded-xl shadow-sm p-6 bg-white hover:shadow-md"
        >
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="text-2xl font-semibold text-[#0A1E2D] mt-1">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
