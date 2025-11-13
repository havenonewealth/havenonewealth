'use client'

import { motion } from 'framer-motion'

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa] text-[#0A1E2D]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="h-10 w-10 border-4 border-[#C6A664] border-t-transparent rounded-full"
      />
      <p className="mt-4 font-medium text-sm">Loading your data...</p>
    </div>
  )
}
