'use client'

import { AppUser } from '@/lib/supabase/admin'

interface UserManagementTableProps {
  users: AppUser[]
}

export default function UserManagementTable({ users }: UserManagementTableProps) {
  if (!users.length) return <div>No users found</div>

  return (
    <table className="w-full border rounded-lg bg-white shadow">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-3">Email</th>
          <th className="p-3">Role</th>
          <th className="p-3">Created</th>
        </tr>
      </thead>

      <tbody>
        {users.map((u, i) => (
          <tr key={i} className="border-t">
            <td className="p-3">{u.email}</td>
            <td className="p-3">{u.role ?? 'N/A'}</td>
            <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
