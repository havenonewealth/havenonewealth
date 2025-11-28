'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AdminUserOverview } from '@/lib/supabase/admin'
import { MoreVertical } from 'lucide-react'
import EditUserModal from './EditUserModal'
import { createClient } from '@/lib/supabaseClient'

interface Props {
  users: AdminUserOverview[]
  onUpdated: () => void         // FIX: add callback prop properly
}

export default function UserManagementTable({ users, onUpdated }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'earned' | 'joined' | 'payouts'>('earned')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<AdminUserOverview | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const filtered = useMemo(() => {
    return users
      .filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortKey) {
          case 'earned':
            return b.lifetime_earned - a.lifetime_earned
          case 'joined':
            return new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime()
          case 'payouts':
            return b.total_payouts - a.total_payouts
          default:
            return 0
        }
      })
  }, [users, search, sortKey])

  async function disableUser(user_id: string) {
    await supabase
      .from('users')
      .update({ role: 'disabled' })
      .eq('id', user_id)

    onUpdated()
  }

  return (
    <div className="space-y-6">

      {/* Header Controls */}
      <div className="flex justify-between items-center">

        <input
          type="text"
          placeholder="Search by email"
          className="border rounded-md px-3 py-2 w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border rounded-md px-3 py-2"
          value={sortKey}
          onChange={e => setSortKey(e.target.value as any)}
        >
          <option value="earned">Sort by Earnings</option>
          <option value="joined">Sort by Joined Date</option>
          <option value="payouts">Sort by Payout Count</option>
        </select>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Lifetime Earned</th>
              <th className="p-3 text-left">Sources</th>
              <th className="p-3 text-left">Payouts</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3 text-left">Last Payout</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(u => {
              const isExpanded = expanded === u.user_id

              return (
                <>
                  <tr
                    key={u.user_id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpanded(prev => (prev === u.user_id ? null : u.user_id))
                    }
                  >
                    <td className="p-3 font-medium">{u.email}</td>

                    <td className="p-3">
                      <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs">
                        {u.role || 'Earner'}
                      </span>
                    </td>

                    <td className="p-3 font-semibold">
                      ${u.lifetime_earned.toLocaleString()}
                    </td>

                    <td className="p-3">{u.total_sources}</td>
                    <td className="p-3">{u.total_payouts}</td>
                    <td className="p-3">{u.joined_date}</td>
                    <td className="p-3">{u.last_payout_date || '—'}</td>

                    <td className="p-3 text-right">
                      <MoreVertical size={18} className="text-gray-500" />
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="p-6 text-sm text-gray-700">
                        <div className="grid grid-cols-3 gap-6">

                          <div>
                            <p className="font-semibold mb-2">Top Metrics</p>
                            <p>Total Earned: ${u.lifetime_earned.toLocaleString()}</p>
                            <p>Total Payouts: {u.total_payouts}</p>
                            <p>Total Sources: {u.total_sources}</p>
                          </div>

                          <div>
                            <p className="font-semibold mb-2">Account</p>
                            <p>Joined: {u.joined_date}</p>
                            <p>Last Payout: {u.last_payout_date || 'None'}</p>
                          </div>

                          <div>
                            <p className="font-semibold mb-2">Actions</p>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/admin/users/${u.user_id}/portfolio`)
                              }}
                              className="text-blue-600 hover:underline block"
                            >
                              View Portfolio
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/admin/users/${u.user_id}/ledger`)
                              }}
                              className="text-blue-600 hover:underline block"
                            >
                              View Payout Ledger
                            </button>

                            <button
                              className="text-blue-600 hover:underline block"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingUser(u)
                                setEditOpen(true)
                              }}
                            >
                              Edit User
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                disableUser(u.user_id)
                              }}
                              className="text-red-600 hover:underline block"
                            >
                              Disable User
                            </button>

                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          open={editOpen}
          setOpen={setEditOpen}
          user={editingUser}
          onUpdated={onUpdated}    // FIX
        />
      )}
    </div>
  )
}
