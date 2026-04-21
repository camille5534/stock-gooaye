'use client'

import { useState } from 'react'
import { Stock } from '@/lib/types'

interface Props { stocks: Stock[] }

const stanceConfig: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  '正面': { icon: '▲', color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)' },
  '負面': { icon: '▼', color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.3)' },
  '中立': { icon: '─', color: '#EAB308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.3)' },
  '觀察': { icon: '◎', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)' },
}

export default function StockTable({ stocks }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {/* Table header */}
      <div
        className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold tracking-widest uppercase"
        style={{ background: 'var(--bg-elevated)', color: 'var(--fg-dim)', borderBottom: '1px solid var(--border-dim)' }}
      >
        <span className="col-span-1" />
        <span className="col-span-2">代號</span>
        <span className="col-span-3">名稱</span>
        <span className="col-span-2">立場</span>
        <span className="col-span-2 text-right">現價</span>
        <span className="col-span-2 text-right">漲跌</span>
      </div>

      {/* Rows */}
      {stocks.map((stock, idx) => {
        const cfg = stanceConfig[stock.stance] ?? stanceConfig['中立']
        const isOpen = expanded === stock.code
        const isLast = idx === stocks.length - 1

        return (
          <div key={stock.code}>
            <button
              onClick={() => setExpanded(isOpen ? null : stock.code)}
              className="w-full grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-left transition-colors duration-100 cursor-pointer"
              style={{
                background: isOpen ? 'var(--bg-elevated)' : 'var(--bg-card)',
                borderBottom: isLast && !isOpen ? 'none' : '1px solid var(--border-dim)',
              }}
              onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)' }}
              onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
            >
              {/* Stance icon */}
              <span className="col-span-1 font-mono font-bold text-sm" style={{ color: cfg.color }}>
                {cfg.icon}
              </span>

              {/* Code */}
              <span className="col-span-2 font-mono text-sm font-bold" style={{ color: 'var(--fg)' }}>
                {stock.code}
              </span>

              {/* Name */}
              <span className="col-span-3 text-sm" style={{ color: 'var(--fg-muted)' }}>
                {stock.name}
              </span>

              {/* Stance label */}
              <span className="col-span-2">
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  {stock.stance}
                </span>
              </span>

              {/* Price */}
              <span className="col-span-2 text-right font-mono text-sm" style={{ color: 'var(--fg)' }}>
                {stock.price ? `$${stock.price.toLocaleString()}` : '—'}
              </span>

              {/* Change */}
              <span
                className="col-span-2 text-right font-mono text-xs"
                style={{
                  color: stock.change_pct == null ? 'var(--fg-dim)'
                       : stock.change_pct >= 0 ? '#22C55E' : '#EF4444',
                }}
              >
                {stock.change_pct == null ? '—'
                 : `${stock.change_pct >= 0 ? '+' : ''}${stock.change_pct.toFixed(1)}%`}
              </span>
            </button>

            {/* Expanded quote */}
            {isOpen && (
              <div
                className="px-4 py-3"
                style={{
                  background: 'var(--bg-card)',
                  borderTop: '1px solid var(--border-dim)',
                  borderBottom: isLast ? 'none' : '1px solid var(--border-dim)',
                  borderLeft: `3px solid ${cfg.color}`,
                }}
              >
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--fg-muted)' }}>
                  {stock.quote}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {stock.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ color: 'var(--fg-dim)', background: 'var(--border-dim)' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
                    {stock.timestamp}
                  </span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
