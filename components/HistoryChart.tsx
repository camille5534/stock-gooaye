'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
import { StockHistory } from '@/lib/types'

interface Props {
  history: StockHistory
}

export default function HistoryChart({ history }: Props) {
  const data = history.sentiment_history.map(d => ({
    ep: `EP${d.ep}`,
    vix: d.vix,
    情緒: d.score * 4, // scale to ~40 to overlap with VIX range
    score: d.score,
  }))

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <span className="text-gray-400 text-sm font-medium tracking-wider uppercase block mb-4">
        VIX × 股癌情緒歷史對照
      </span>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="ep" tick={{ fill: '#6b7280', fontSize: 11 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 6 }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value, name) => {
              const v = Number(value)
              if (name === '情緒') return [`${Math.round(v / 4)}/10`, '股癌情緒']
              return [v.toFixed(1), 'VIX']
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(v) => v === '情緒' ? '股癌情緒 (×4)' : 'VIX'}
          />
          <ReferenceLine y={30} stroke="#f97316" strokeDasharray="4 4" opacity={0.5} />
          <Line type="monotone" dataKey="vix" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} name="VIX" />
          <Line type="monotone" dataKey="情緒" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#22d3ee' }} name="情緒" />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-gray-600 text-xs mt-2 text-center">橘色虛線 = VIX 30 警戒線</p>
    </div>
  )
}
