'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList
} from 'recharts'
import { EarningsBySource } from '@/lib/supabase/admin'

export default function EarningsBySourceChart({ data }: { data: EarningsBySource[] }) {
    const chartData = data.map((s) => ({
        name: s.name,
        value: s.total_earned
    }))

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />

                    <Bar dataKey="value" fill="#0F172A" radius={[5, 5, 0, 0]}>
                        <LabelList dataKey="value" position="top" fill="#0F172A" fontSize={12} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
