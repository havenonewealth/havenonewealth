import { createSupabaseServer } from '@/lib/supabaseServer'
import { getAdminUserOverview } from '@/lib/supabase/admin'
import AdminUserHeader from '@/components/admin-dashboard/AdminUserHeader'

export const dynamic = 'force-dynamic'

export default async function AdminUserPage({ params }: { params: { id: string } }) {
    const supabase = createSupabaseServer()

    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
        return <div>Unauthorized</div>
    }

    const users = await getAdminUserOverview()
    const user = users.find(u => u.user_id === params.id)

    if (!user) {
        return <div className="p-10 text-gray-500">User not found</div>
    }

    return (
        <div className="p-10 max-w-5xl mx-auto">
            <AdminUserHeader user={user} />

            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-semibold mb-4">Account Details</h2>

                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <p>Joined: {user.joined_date}</p>
                <p>Last Payout: {user.last_payout_date || 'None'}</p>
            </div>
        </div>
    )
}
