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
  d1_date: string | null
  d1_price: number | null
  d1_pct: number | null
  d7_date: string | null
  d7_price: number | null
  d7_pct: number | null
  d14_date: string | null
  d14_price: number | null
  d14_pct: number | null
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

const pctColor = (v: number | null) =>
  v === null ? 'var(--fg-dim)' : v > 0 ? 'var(--stance-pos)' : v < 0 ? 'var(--stance-neg)' : 'var(--fg-muted)'

const fmtPct = (v: number | null) =>
  v === null ? '─' : `${v > 0 ? '+' : ''}${v}%`

const fmtDate = (d: string | null) =>
  d ? d.slice(5).replace('-', '/') : '─'

function PctCell({ label, pct, date }: { label: string; pct: number | null; date: string | null }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--fg-dim)' }}>{label}</span>
      <span
        className="font-mono font-bold"
        style={{ fontSize: '13px', color: pctColor(pct) }}
      >
        {fmtPct(pct)}
      </span>
      <span className="font-mono" style={{ fontSize: '9px', color: 'var(--fg-dim)' }}>
        {fmtDate(date)}
      </span>
    </div>
  )
}

export default function PicksBoard({ data }: Props) {
  const { stats, picks } = data
  const [filter, setFilter] = useState<'all' | 'hit' | 'miss' | 'pending'>('all')

  const filtered = picks.filter(p => {
    if (filter === 'all') return p.status !== 'no_data'
    return p.status === filter
  })

  // 依集數分組，最新在前
  const byEpisode = filtered.reduce((acc, p) => {
    if (!acc[p.episode]) acc[p.episode] = []
    acc[p.episode].push(p)
    return acc
  }, {} as Record<number, Pick[]>)
  const episodes = Object.keys(byEpisode).map(Number).sort((a, b) => b - a)

  const winRateColor =
    stats.win_rate >= 70 ? 'var(--stance-pos)' :
    stats.win_rate >= 50 ? 'var(--yellow)' :
    'var(--stance-neg)'

  return (
    <div className="flex flex-col gap-5">

      {/* 標題 */}
      <div>
        <h1 className="font-mono font-bold text-lg" style={{ color: 'var(--fg)' }}>
          主委選股成績單
        </h1>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>
          驗證：正面/負面立場 → 比較播出日、D+1、D+7、D+14 收盤漲跌。勝率以次日（D+1）為準。
        </p>
      </div>

      {/* 統計卡 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border p-4 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="font-mono font-bold text-3xl" style={{ color: winRateColor }}>
            {stats.win_rate}%
          </div>
          <div className="font-mono text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>整體勝率（D+1）</div>
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

      {/* 勝率條 */}
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
            all:     { bg: 'rgba(67,85,176,0.10)',  border: '#4355B0', fg: '#4355B0' },
            hit:     { bg: 'rgba(29,122,69,0.10)',   border: 'var(--stance-pos)', fg: 'var(--stance-pos)' },
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

      {/* 集數分組卡片 */}
      <div className="flex flex-col gap-4">
        {episodes.map(ep => {
          const epPicks = byEpisode[ep]
          const epDate = epPicks[0].ep_date_actual ?? epPicks[0].date
          const epHits = epPicks.filter(p => p.status === 'hit').length
          const epValid = epPicks.filter(p => p.status === 'hit' || p.status === 'miss').length
          const epRate = epValid > 0 ? Math.round(epHits / epValid * 100) : null

          return (
            <div
              key={ep}
              className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              {/* 集數 Header */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-dim)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm" style={{ color: 'var(--accent)' }}>
                    EP{ep}
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--fg-dim)' }}>
                    {epDate.slice(5).replace('-', '/')}
                  </span>
                </div>
                {epValid > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
                      命中 {epHits}/{epValid}
                    </span>
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: (epRate ?? 0) >= 50 ? 'var(--stance-pos)' : 'var(--stance-neg)',
                        background: (epRate ?? 0) >= 50 ? 'var(--stance-pos-bg)' : 'var(--stance-neg-bg)',
                      }}
                    >
                      {epRate}%
                    </span>
                  </div>
                )}
              </div>

              {/* 個股列表 */}
              <div className="divide-y" style={{ borderColor: 'var(--border-dim)' }}>
                {epPicks.map((p, i) => {
                  const resultColor =
                    p.status === 'hit'     ? 'var(--stance-pos)' :
                    p.status === 'miss'    ? 'var(--stance-neg)' :
                    p.status === 'pending' ? 'var(--yellow)'     :
                    'var(--border-dim)'

                  const resultIcon =
                    p.status === 'hit'     ? '✓' :
                    p.status === 'miss'    ? '✗' :
                    p.status === 'pending' ? '…' : '─'

                  const resultBg =
                    p.status === 'hit'     ? 'var(--stance-pos-bg)' :
                    p.status === 'miss'    ? 'var(--stance-neg-bg)' :
                    p.status === 'pending' ? 'rgba(138,96,0,0.10)' : 'transparent'

                  return (
                    <div
                      key={`${p.episode}-${p.code}-${i}`}
                      className="px-4 py-3"
                      style={{ borderLeft: `3px solid ${resultColor}` }}
                    >
                      {/* 股票名稱行 */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm" style={{ color: 'var(--fg)' }}>
                            {p.code}
                          </span>
                          <span className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
                            {p.name}
                          </span>
                          <span
                            className="font-mono text-xs px-1.5 py-0.5 rounded"
                            style={{ color: stanceColor(p.stance_score), background: stanceBg(p.stance_score) }}
                          >
                            {stanceIcon(p.stance_score)} {p.stance}
                          </span>
                        </div>
                        <span
                          className="font-mono font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full shrink-0"
                          style={{ color: resultColor, background: resultBg }}
                        >
                          {resultIcon}
                        </span>
                      </div>

                      {/* 原文 Quote */}
                      {p.quote && (
                        <p
                          className="font-mono text-xs leading-relaxed mb-3"
                          style={{ color: 'var(--fg-muted)', borderLeft: '2px solid var(--border-dim)', paddingLeft: '8px' }}
                        >
                          {p.quote}
                        </p>
                      )}

                      {/* D+1 / D+7 / D+14 */}
                      <div className="flex items-center gap-1">
                        {/* 播出日 */}
                        <div className="flex flex-col items-center gap-0.5 min-w-[44px]">
                          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--fg-dim)' }}>播出</span>
                          <span className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
                            {p.ep_price ?? '─'}
                          </span>
                          <span className="font-mono" style={{ fontSize: '9px', color: 'var(--fg-dim)' }}>
                            {fmtDate(p.ep_date_actual)}
                          </span>
                        </div>

                        <span style={{ color: 'var(--border)', fontSize: '16px', margin: '0 4px' }}>→</span>

                        <PctCell label="D+1" pct={p.d1_pct} date={p.d1_date} />

                        <div style={{ width: '1px', height: '32px', background: 'var(--border-dim)', margin: '0 4px' }} />

                        <PctCell label="D+7" pct={p.d7_pct} date={p.d7_date} />

                        <div style={{ width: '1px', height: '32px', background: 'var(--border-dim)', margin: '0 4px' }} />

                        <PctCell label="D+14" pct={p.d14_pct} date={p.d14_date} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 底部說明 */}
      <p className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
        * 播出日收盤為基準；D+1/D+7/D+14 為相對漲跌幅。勝率以 D+1 方向為準。觀察/中立立場不計入。
      </p>
    </div>
  )
}
