'use client'

interface Props {
  score: number
  label: string
  bull_pct: number
  bear_pct: number
}

export default function SentimentBar({ score, label, bull_pct, bear_pct }: Props) {
  const dots = 10
  const filledDots = Math.round((bull_pct / 100) * dots)

  const labelColor =
    bull_pct >= 60 ? 'text-green-400' :
    bear_pct >= 60 ? 'text-red-400' :
    'text-yellow-400'

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium tracking-wider uppercase">多空情緒</span>
        <span className={`text-sm font-bold ${labelColor}`}>{label}</span>
      </div>

      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: dots }).map((_, i) => (
          <div
            key={i}
            className={`h-4 flex-1 rounded-sm transition-all duration-300 ${
              i < filledDots ? 'bg-green-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-green-400 font-medium">多 {bull_pct}%</span>
        <span className="text-red-400 font-medium">空 {bear_pct}%</span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 flex justify-center">
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${i < score ? 'opacity-100' : 'opacity-20'} ${labelColor}`}
            >
              ▪
            </span>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 mt-1">情緒分數 {score}/10</p>
    </div>
  )
}
