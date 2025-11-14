'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

export default function HavenOneLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fefdf9] text-[#0A1E2D] font-[Lato]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
            <p className="text-sm text-gray-600 italic">Clarity begins here</p>
          </div>
        </header>
        <h1 className="text-3xl font-semibold mb-8 text-[#0A1E2D]">{title}</h1>
        {children}
      </div>
    </main>
  )
}
