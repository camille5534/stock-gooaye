'use client'

import { useState } from 'react'
import { Stock } from '@/lib/types'

interface Props {
  stocks: Stock[]
}

const stanceStyle: Record<string, string> = {
  '正面': 'text-green-400 border-green-800 bg-green-950',
  '負面': 'text-red-400 border-red-800 bg-red-950',
  '中立': 'text-yellow-400 border-yellow-800 bg-yellow-950',
  '觀察': 'text-blue-400 border-blue-800 bg-blue-950',
}

const stanceIcon: Record<string, string> = {
  '正面': '▲',
  '負面': '▼',
  '中立': '─',
  '觀察': '◎',
}

export default function StockTable({ stocks }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {stocks.map((stock) => (
        <div key={stock.code} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left"
            onClick={() => setExpanded(expanded === stock.code ? null : stock.code)}
          >
            <span className={`text-sm font-bold ${stanceStyle[stock.stance].split(' ')[0]}`}>
              {stanceIcon[stock.stance]}
            </span>
            <span className="text-white font-mono font-bold text-sm w-16">{stock.code}</span>
            <span className="text-gray-300 text-sm flex-1">{stock.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded border ${stanceStyle[stock.stance]}`}>
              {stock.stance}
            </span>
            {stock.price && (
              <span className="text-gray-400 text-xs font-mono ml-2">
                ${stock.price.toLocaleString()}
              </span>
            )}
            {stock.change_pct !== undefined && (
              <span className={`text-xs font-mono ${stock.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(1)}%
              </span>
            )}
            <span className="text-gray-600 text-xs ml-1">{expanded === stock.code ? '▲' : '▼'}</span>
          </button>

          {expanded === stock.code && (
            <div className="px-4 pb-4 border-t border-gray-700 bg-gray-800/50">
              <p className="text-gray-300 text-sm mt-3 leading-relaxed italic">{stock.quote}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1 flex-wrap mt-1">
                  {stock.tags.map(tag => (
                    <span key={tag} className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-gray-600 text-xs">{stock.timestamp}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
