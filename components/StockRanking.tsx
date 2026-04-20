'use client'

import { useState } from 'react'
import { Episode } from '@/lib/types'

interface Rank { code: string; name: string; count: number; episodes: number[] }
interface Props {
  rankings: Rank[]
  episodes: Episode[]
}

const stanceStyle = {
  '正面': { icon: '▲', color: 'var(--stance-pos)', bg: 'var(--stance-pos-bg)' },
  '負面': { icon: '▼', color: 'var(--stance-neg)', bg: 'var(--stance-neg-bg)' },
  '中立': { icon: '─', color: 'var(--stance-neu)', bg: 'var(--stance-neu-bg)' },
  '觀察': { icon: '◎', color: 'var(--stance-obs)', bg: 'var(--stance-obs-bg)' },
} as const

type ActiveKey = { code: string; ep: number } | null

export default function StockRanking({ rankings, episodes }: Props) {
  const max    = rankings[0]?.count ?? 1
  const [active, setActive] = useState<ActiveKey>(null)

  function toggle(code: string, ep: number) {
    setActive(prev =>
      prev?.code === code && prev?.ep === ep ? null : { code, ep }
    )
  }

  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-3"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-muted)' }}>
        歷史提及排行
      </span>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {rankings.map((r, i) => {
          const pct     = (r.count / max) * 100
          const opacity = Math.max(0.25, 1 - i * 0.06)

          return (
            <div key={r.code} className="flex flex-col gap-1.5">

              {/* 排名 + 代號 + 名稱 + 次數 */}
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-start gap-1 min-w-0">
                  <span
                    className="font-mono font-bold shrink-0 mt-0.5"
                    style={{
                      fontSize: '10px',
                      color: i === 0 ? 'var(--cyan)' : 'var(--fg-dim)',
                      width: '14px',
                      textAlign: 'right',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono font-semibold" style={{ fontSize: '12px', color: 'var(--fg)' }}>
                      {r.code}
                    </span>
                    <span className="font-mono truncate" style={{ fontSize: '9px', color: 'var(--fg-dim)' }}>
                      {r.name}
                    </span>
                  </div>
                </div>
                <span className="font-mono tabular-nums shrink-0" style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>
                  {r.count}
                </span>
              </div>

              {/* 進度條 */}
              <div className="h-1 rounded-full" style={{ background: 'var(--border-dim)', marginLeft: '18px' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: 'var(--cyan)', opacity }}
                />
              </div>

              {/* EP badges：可點擊，顏色對應立場 */}
              <div className="flex gap-1 flex-wrap" style={{ marginLeft: '18px' }}>
                {r.episodes.map(epNum => {
                  const stock  = episodes.find(e => e.episode === epNum)?.stocks.find(s => s.code === r.code)
                  const sc     = stock ? stanceStyle[stock.stance as keyof typeof stanceStyle] : null
                  const isOpen = active?.code === r.code && active?.ep === epNum

                  return (
                    <button
                      key={epNum}
                      onClick={() => toggle(r.code, epNum)}
                      className="font-mono rounded transition-colors duration-150"
                      style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        color:      sc ? sc.color : 'var(--fg-dim)',
                        background: isOpen && sc ? sc.bg : 'var(--border-dim)',
                        border:     `1px solid ${isOpen && sc ? sc.color : 'transparent'}`,
                        cursor: 'pointer',
                      }}
                    >
                      {sc ? `${sc.icon} ` : ''}EP{epNum}
                    </button>
                  )
                })}
              </div>

              {/* 展開語錄 */}
              {r.episodes.map(epNum => {
                if (active?.code !== r.code || active?.ep !== epNum) return null
                const stock = episodes.find(e => e.episode === epNum)?.stocks.find(s => s.code === r.code)
                if (!stock) return null
                const sc = stanceStyle[stock.stance as keyof typeof stanceStyle]

                return (
                  <div
                    key={epNum}
                    className="accordion-content rounded-lg p-2.5 flex flex-col gap-1.5"
                    style={{
                      marginLeft: '18px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-dim)',
                    }}
                  >
                    <span
                      className="font-mono font-bold px-1.5 py-0.5 rounded w-fit"
                      style={{ fontSize: '11px', color: sc.color, background: sc.bg }}
                    >
                      {sc.icon} {stock.stance}
                    </span>
                    <p
                      className="font-mono leading-relaxed"
                      style={{ fontSize: '11px', color: 'var(--fg-muted)' }}
                    >
                      &ldquo;{stock.quote}&rdquo;
                    </p>
                  </div>
                )
              })}

            </div>
          )
        })}
      </div>

      <div className="pt-1 border-t text-xs font-mono" style={{ borderColor: 'var(--border-dim)', color: 'var(--fg-dim)' }}>
        累計所有集數 · 點擊 EP 標籤查看語錄
      </div>
    </div>
  )
}
