'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { StockHistory } from '@/lib/types'

interface Props { history: StockHistory }

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded border px-3 py-2 text-xs"
      style={{ background: '#0F172A', borderColor: '#334155' }}
    >
      <p className="font-mono font-semibold mb-1" style={{ color: '#94A3B8' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span style={{ color: p.color }}>
            股癌情緒: {Math.round(p.value / 4)}/10
          </span>
        </div>
      ))}
    </div>
  )
}

export default function HistoryChart({ history }: Props) {
  const data = history.sentiment_history.map(d => ({
    ep:   `EP${d.episode}`,
    情緒: d.score * 4,
    score: d.score,
  }))

  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-muted)' }}>
          股癌情緒歷史趨勢
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="w-3 h-0.5 inline-block rounded" style={{ background: '#22D3EE' }} />
          <span style={{ color: '#22D3EE' }}>情緒分</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="ep"
            tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'var(--font-geist-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'var(--font-geist-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="情緒"
            stroke="#22D3EE"
            strokeWidth={2}
            dot={{ r: 3, fill: '#22D3EE', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#22D3EE' }}
            name="情緒"
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs mt-2" style={{ color: 'var(--fg-dim)' }}>
        情緒分 1–10，越高越偏多
      </p>
    </div>
  )
}
