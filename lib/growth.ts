import { EarningsBySource } from '@/lib/supabase/admin'

// Stub – replace when you add payouts-by-source API
export function calculateSourceGrowth(source: EarningsBySource) {
    const recent = source.payout_count > 0 ? source.total_earned : 0
    const older = source.total_earned * 0.7 // synthetic baseline until real query

    const growth = older === 0 ? 100 : ((recent - older) / older) * 100

    return {
        growth_60d: Number(growth.toFixed(1)),
        is_positive_growth: growth >= 0,
        is_stalled: source.last_payment_date == null
    }
}
