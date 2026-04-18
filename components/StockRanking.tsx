'use client'

interface Rank {
  code: string
  name: string
  count: number
}

interface Props {
  rankings: Rank[]
}

export default function StockRanking({ rankings }: Props) {
  const max = rankings[0]?.count ?? 1

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <span className="text-gray-400 text-sm font-medium tracking-wider uppercase block mb-3">
        歷史提及排行
      </span>
      <div className="space-y-2.5">
        {rankings.map((r, i) => (
          <div key={r.code} className="flex items-center gap-2">
            <span className="text-gray-600 text-xs w-4 text-right">{i + 1}</span>
            <span className="text-gray-400 font-mono text-xs w-14">{r.code}</span>
            <div className="flex-1 relative h-4 bg-gray-700 rounded-sm overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-cyan-700 rounded-sm transition-all duration-500"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </div>
            <span className="text-gray-400 text-xs w-12 text-right tabular-nums">{r.count} 次</span>
          </div>
        ))}
      </div>
    </div>
  )
}
