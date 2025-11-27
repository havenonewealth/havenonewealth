'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { EarningsBySource } from '@/lib/supabase/admin'

const COLORS = ['#0F172A', '#334155', '#64748B', '#94A3B8', '#CBD5E1']

export default function SourceContributionPie({ data }: { data: EarningsBySource[] }) {

    // Transform to Recharts-friendly format
    const chartData = data.map((s) => ({
        name: s.name,
        value: s.total_earned
    }))

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                    >
                        {chartData.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </Pie>

                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
