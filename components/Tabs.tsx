type TabKey = 'sources' | 'payouts' | 'analytics'

interface TabsProps {
  activeTab: TabKey
  onTabChange: (v: TabKey) => void
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs: TabKey[] = ['sources', 'payouts', 'analytics']
  return (
    <div className='flex gap-3 mb-6'>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-md font-semibold ${
            activeTab === tab
              ? 'bg-[#C6A664] text-[#0A1E2D]'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  )
}
