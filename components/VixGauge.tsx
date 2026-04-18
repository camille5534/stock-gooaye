'use client'

import { VixData } from '@/lib/types'

interface Props {
  vix: VixData
}

function getZoneColor(value: number) {
  if (value < 20) return { bg: 'bg-green-500', text: 'text-green-400', label: '貪婪', bar: '#22c55e' }
  if (value < 30) return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: '中性', bar: '#eab308' }
  if (value < 40) return { bg: 'bg-orange-500', text: 'text-orange-400', label: '恐慌', bar: '#f97316' }
  return { bg: 'bg-red-500', text: 'text-red-400', label: '極度恐慌', bar: '#ef4444' }
}

export default function VixGauge({ vix }: Props) {
  const zone = getZoneColor(vix.current)
  const pct = Math.min((vix.current / 60) * 100, 100)

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium tracking-wider uppercase">VIX 恐慌指數</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${zone.text} border-current`}>
          {zone.label}
        </span>
      </div>

      <div className="flex items-end gap-2 mb-3">
        <span className={`text-4xl font-bold tabular-nums ${zone.text}`}>
          {vix.current.toFixed(1)}
        </span>
      </div>

      {/* 進度條 */}
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: zone.bar }}
        />
        {/* 20/30/40 刻度線 */}
        {[20, 30, 40].map(v => (
          <div
            key={v}
            className="absolute top-0 h-full w-px bg-gray-500 opacity-60"
            style={{ left: `${(v / 60) * 100}%` }}
          />
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>0 貪婪</span>
        <span>20</span>
        <span>30</span>
        <span>40</span>
        <span>60 恐慌</span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <span className="text-gray-500 text-xs">
          更新：{new Date(vix.updated_at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
