export default function KPI({ label, value }: { label: string, value: string }) {
  return (
    <div className='bg-[#fdfbf7] p-5 rounded-xl border border-gray-200 text-center shadow-sm'>
      <p className='text-gray-500 text-sm mb-1'>{label}</p>
      <p className='text-2xl font-semibold'>{value}</p>
    </div>
  )
}
