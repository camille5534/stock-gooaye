'use client'

import { useState } from 'react'

interface Pick {
  episode: number
  date: string
  code: string
  name: string
  stance: string
  stance_score: number
  quote: string
  ticker: string
  ep_date_actual: string | null
  ep_price: number | null
  next_day: string | null
  next_price: number | null
  return_pct: number | null
  correct: boolean | null
  status: 'hit' | 'miss' | 'pending' | 'no_data'
}

interface Stats {
  total: number
  valid: number
  hits: number
  misses: number
  pending: number
  win_rate: number
}

interface Props {
  data: { generated_at: string; stats: Stats; picks: Pick[] }
}

const stanceColor = (score: number) =>
  score > 0 ? 'var(--stance-pos)' : score < 0 ? 'var(--stance-neg)' : 'var(--fg-dim)'

const stanceBg = (score: number) =>
  score > 0 ? 'var(--stance-pos-bg)' : score < 0 ? 'var(--stance-neg-bg)' : 'transparent'

const stanceIcon = (score: number) => (score > 0 ? '▲' : score < 0 ? '▼' : '─')

export default function PicksBoard({ data }: Props) {
  const { stats, picks } = data
  const [filter, setFilter] = useState<'all' | 'hit' | 'miss' | 'pending'>('all')

  const filtered = picks.filter(p => {
    if (filter === 'all') return p.status !== 'no_data'
    return p.status === filter
  })

  const winRateColor =
    stats.win_rate >= 70 ? 'var(--stance-pos)' :
    stats.win_rate >= 50 ? 'var(--yellow)'     :
    'var(--stance-neg)'

  return (
    <div className="flex flex-col gap-5">

      {/* 標題說明 */}
      <div>
        <h1 className="font-mono font-bold text-lg" style={{ color: 'var(--fg)' }}>
          主委選股成績單
        </h1>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>
          驗證方式：主委在某集說「正面/負面」→ 隔個交易日收盤比較 → 方向對了算命中
        </p>
      </div>

      {/* 統計卡 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border p-4 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="font-mono font-bold text-3xl" style={{ color: winRateColor }}>
            {stats.win_rate}%
          </div>
          <div className="font-mono text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>整體勝率</div>
        </div>
        <div className="rounded-lg border p-4 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="font-mono font-bold text-3xl" style={{ color: 'var(--stance-pos)' }}>
            {stats.hits}
          </div>
          <div className="font-mono text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>命中次數</div>
        </div>
        <div className="rounded-lg border p-4 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="font-mono font-bold text-3xl" style={{ color: 'var(--fg-muted)' }}>
            {stats.valid}
          </div>
          <div className="font-mono text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>有效預測</div>
        </div>
      </div>

      {/* 勝率進度條 */}
      <div className="rounded-lg border px-4 py-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex justify-between text-xs font-mono mb-2" style={{ color: 'var(--fg-muted)' }}>
          <span>命中 {stats.hits} 次</span>
          <span>失準 {stats.misses} 次</span>
        </div>
        <div className="w-full rounded-full overflow-hidden" style={{ height: '8px', background: 'var(--border-dim)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.win_rate}%`, background: winRateColor }}
          />
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'hit', 'miss', 'pending'] as const).map(f => {
          const labels = { all: '全部', hit: '✓ 命中', miss: '✗ 失準', pending: '等待中' }
          const colors = {
            all:     { bg: 'rgba(67,85,176,0.10)', border: '#4355B0', fg: '#4355B0' },
            hit:     { bg: 'rgba(29,122,69,0.10)',  border: 'var(--stance-pos)', fg: 'var(--stance-pos)' },
            miss:    { bg: 'rgba(196,43,43,0.10)',   border: 'var(--stance-neg)', fg: 'var(--stance-neg)' },
            pending: { bg: 'rgba(138,96,0,0.10)',    border: 'var(--yellow)',     fg: 'var(--yellow)' },
          }
          const c = colors[f]
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-3 py-1 rounded-full border font-mono transition-colors duration-100 cursor-pointer"
              style={{
                background: active ? c.bg : 'transparent',
                borderColor: active ? c.border : 'var(--border-dim)',
                color: active ? c.fg : 'var(--fg-dim)',
              }}
            >
              {labels[f]}
            </button>
          )
        })}
        <span className="text-xs font-mono self-center" style={{ color: 'var(--fg-dim)' }}>
          {filtered.length} 筆
        </span>
      </div>

      {/* 表格 */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        {/* 表頭 */}
        <div
          className="hidden md:grid font-mono text-xs px-4 py-2"
          style={{
            gridTemplateColumns: '80px 1fr 64px 80px 90px 90px 72px 52px',
            background: 'var(--bg-elevated)',
            borderBottom: '2px solid var(--border)',
            color: 'var(--fg-muted)',
          }}
        >
          <span>代號</span>
          <span>名稱</span>
          <span>集數</span>
          <span>立場</span>
          <span className="text-right">播出收盤</span>
          <span className="text-right">次日收盤</span>
          <span className="text-right">漲跌</span>
          <span className="text-center">結果</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center font-mono text-sm" style={{ color: 'var(--fg-dim)' }}>
            沒有符合條件的紀錄
          </div>
        ) : (
          filtered.map((p, i) => {
            const isEven = i % 2 === 0
            const retColor = p.return_pct === null ? 'var(--fg-dim)'
              : p.return_pct > 0 ? 'var(--stance-pos)'
              : p.return_pct < 0 ? 'var(--stance-neg)'
              : 'var(--fg-muted)'

            const resultBadge =
              p.status === 'hit'     ? { icon: '✓', color: 'var(--stance-pos)', bg: 'var(--stance-pos-bg)' } :
              p.status === 'miss'    ? { icon: '✗', color: 'var(--stance-neg)', bg: 'var(--stance-neg-bg)' } :
              p.status === 'pending' ? { icon: '…', color: 'var(--yellow)',     bg: 'rgba(138,96,0,0.10)' }  :
                                       { icon: '─', color: 'var(--fg-dim)',     bg: 'transparent' }

            return (
              <div
                key={`${p.episode}-${p.code}`}
                style={{
                  background: isEven ? 'var(--bg-card)' : 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border-dim)',
                  borderLeft: `3px solid ${p.status === 'hit' ? 'var(--stance-pos)' : p.status === 'miss' ? 'var(--stance-neg)' : 'var(--border-dim)'}`,
                }}
              >
                {/* 桌機列 */}
                <div
                  className="hidden md:grid items-center px-4 py-2.5 font-mono text-sm"
                  style={{ gridTemplateColumns: '80px 1fr 64px 80px 90px 90px 72px 52px' }}
                >
                  <span className="font-bold" style={{ color: 'var(--fg)', fontSize: '12px' }}>
                    {p.code}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{p.name}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--accent)' }}>EP{p.episode}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded w-fit"
                    style={{ color: stanceColor(p.stance_score), background: stanceBg(p.stance_score) }}
                  >
                    {stanceIcon(p.stance_score)} {p.stance}
                  </span>
                  <span className="text-right text-xs" style={{ color: 'var(--fg-muted)' }}>
                    {p.ep_price ?? '─'}
                  </span>
                  <span className="text-right text-xs" style={{ color: 'var(--fg-muted)' }}>
                    {p.next_price ?? '─'}
                  </span>
                  <span className="text-right text-xs font-bold" style={{ color: retColor }}>
                    {p.return_pct !== null ? `${p.return_pct > 0 ? '+' : ''}${p.return_pct}%` : '─'}
                  </span>
                  <div className="flex justify-center">
                    <span
                      className="font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full"
                      style={{ color: resultBadge.color, background: resultBadge.bg }}
                    >
                      {resultBadge.icon}
                    </span>
                  </div>
                </div>

                {/* 手機列 */}
                <div className="md:hidden px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm" style={{ color: 'var(--fg)' }}>{p.code}</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>EP{p.episode}</span>
                      <span
                        className="font-mono text-xs px-1 py-0.5 rounded"
                        style={{ color: stanceColor(p.stance_score), background: stanceBg(p.stance_score) }}
                      >
                        {stanceIcon(p.stance_score)} {p.stance}
                      </span>
                    </div>
                    <span className="font-mono text-xs truncate" style={{ color: 'var(--fg-muted)' }}>{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.return_pct !== null && (
                      <span className="font-mono text-sm font-bold" style={{ color: retColor }}>
                        {p.return_pct > 0 ? '+' : ''}{p.return_pct}%
                      </span>
                    )}
                    <span
                      className="font-bold text-sm w-7 h-7 flex items-center justify-center rounded-full"
                      style={{ color: resultBadge.color, background: resultBadge.bg }}
                    >
                      {resultBadge.icon}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 底部說明 */}
      <p className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
        * 「播出收盤」= 集數發布日當天收盤；「次日收盤」= 下一個交易日收盤。台股代號查台灣加權市場，美股直接查。觀察/中立立場不計入。
      </p>
    </div>
  )
}
