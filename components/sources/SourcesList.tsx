import { IncomeSource, PortfolioAggregate } from '@/lib/types'

interface Props {
  sources: IncomeSource[]
  aggregates: PortfolioAggregate[]
}

export default function SourcesList({ sources, aggregates }: Props) {
  // Build a dictionary { source_name -> total_expected }
  const expectedMap: Record<string, number> = {}
  aggregates.forEach(a => {
    expectedMap[a.source_name] = a.total_expected
  })

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Source Overview</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Source</th>
            <th className="py-2 text-left">Category</th>
            <th className="py-2 text-left">Expected Monthly</th>
            <th className="py-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {sources.map((src, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{src.name}</td>
              <td className="py-2">{src.category || '-'}</td>
              <td className="py-2">
                ${expectedMap[src.name]?.toLocaleString() || '0'}
              </td>
              <td className="py-2">{src.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
