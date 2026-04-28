'use client'

import { useState, useEffect } from 'react'

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

// CSS keyframes injected once
const STYLES = `
@keyframes pb-arc-in {
  from { stroke-dashoffset: var(--arc-full); }
  to   { stroke-dashoffset: var(--arc-to); }
}
@keyframes pb-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pb-badge-pop {
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.25); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes pb-filter-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pb-bullet-grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
`

function useStyleOnce() {
  useEffect(() => {
    if (document.getElementById('pb-styles')) return
    const s = document.createElement('style')
    s.id = 'pb-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }, [])
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    const id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [target, duration])
  return value
}

function WinRateDonut({ hits, misses, pending, winRate, winRateColor }: {
  hits: number; misses: number; pending: number; winRate: number; winRateColor: string
}) {
  const total = hits + misses + pending
  if (total === 0) return null
  const r = 40, sw = 10, size = 110, cx = size / 2, cy = size / 2
  const C = 2 * Math.PI * r
  const segs = [
    { v: hits,    color: 'var(--stance-pos)' },
    { v: misses,  color: 'var(--stance-neg)' },
    { v: pending, color: 'var(--yellow)' },
  ]

  const displayRate = useCountUp(winRate, 900)

  let cum = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-dim)" strokeWidth={sw} />
      {segs.map((seg, i) => {
        if (!seg.v) return null
        const frac = seg.v / total
        const dashTo = -cum * C
        cum += frac
        return (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={sw}
            strokeDasharray={`${frac * C} ${C}`}
            style={{
              '--arc-full': `${C}px`,
              '--arc-to': `${dashTo}px`,
              strokeDashoffset: dashTo,
              animation: `pb-arc-in 700ms cubic-bezier(0.22,1,0.36,1) ${i * 120}ms both`,
              transformOrigin: `${cx}px ${cy}px`,
            } as React.CSSProperties}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )
      })}
      <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
        style={{ fill: winRateColor, fontFamily: 'monospace', fontWeight: 700, fontSize: '20px' }}>
        {displayRate}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle"
        style={{ fill: 'var(--fg-dim)', fontFamily: 'monospace', fontSize: '9px' }}>
        D+1 勝率
      </text>
    </svg>
  )
}

const stanceColor = (score: number) =>
  score > 0 ? 'var(--stance-pos)' : score < 0 ? 'var(--stance-neg)' : 'var(--fg-dim)'

const stanceBg = (score: number) =>
  score > 0 ? 'var(--stance-pos-bg)' : score < 0 ? 'var(--stance-neg-bg)' : 'transparent'

const stanceIcon = (score: number) => (score > 0 ? '▲' : score < 0 ? '▼' : '─')

const fmtPct = (v: number | null) =>
  v === null ? '─' : `${v > 0 ? '+' : ''}${v}%`

const fmtDate = (d: string | null) =>
  d ? d.slice(5).replace('-', '/') : '─'

const pctTextColor = (v: number | null) =>
  v === null ? 'var(--fg-dim)' : v > 0 ? 'var(--stance-pos)' : v < 0 ? 'var(--stance-neg)' : 'var(--fg-muted)'

// ±15% = 50% bar width (full half); values beyond 15% fill the entire half
const BULLET_MAX = 15

function BulletRow({ label, pct, date, delay = 0 }: {
  label: string; pct: number | null; date: string | null; delay?: number
}) {
  const fillPct = pct === null ? 0 : Math.min(Math.abs(pct) / BULLET_MAX * 50, 50)
  const isPos = pct !== null && pct > 0
  const isNeg = pct !== null && pct < 0
  const barColor = isPos ? 'var(--stance-pos)' : isNeg ? 'var(--stance-neg)' : 'transparent'

  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <span className="font-mono shrink-0" style={{ width: 30, fontSize: 10, textAlign: 'right', color: 'var(--fg-dim)' }}>
        {label}
      </span>

      {/* Bar track */}
      <div className="relative flex-1" style={{ height: 6, borderRadius: 3, minWidth: 0 }}>
        {/* Background */}
        <div className="absolute inset-0" style={{ background: 'var(--border-dim)', borderRadius: 3 }} />
        {/* Center tick */}
        <div className="absolute" style={{
          left: '50%', top: -3, bottom: -3, width: 1.5,
          background: 'var(--border)', transform: 'translateX(-50%)',
        }} />
        {/* Animated fill */}
        {pct !== null && pct !== 0 && (
          <div style={{
            position: 'absolute',
            top: 0, bottom: 0,
            borderRadius: 3,
            width: `${fillPct}%`,
            background: barColor,
            left: isPos ? '50%' : `${50 - fillPct}%`,
            transformOrigin: isPos ? 'left center' : 'right center',
            animation: `pb-bullet-grow 500ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
          }} />
        )}
      </div>

      {/* Percentage */}
      <span className="font-mono font-bold shrink-0" style={{
        width: 52, fontSize: 13, textAlign: 'right',
        color: pctTextColor(pct),
      }}>
        {fmtPct(pct)}
      </span>

      {/* Date */}
      <span className="font-mono shrink-0" style={{ width: 32, fontSize: 9, color: 'var(--fg-dim)' }}>
        {fmtDate(date)}
      </span>
    </div>
  )
}

// ── EpCard：獨立元件避免每次 render 重建 ──────────────────────────────────
interface EpCardProps {
  ep: number
  epPicks: Pick[]
  epIdx: number
}

function EpCard({ ep, epPicks, epIdx }: EpCardProps) {
  const epDate  = epPicks[0].ep_date_actual ?? epPicks[0].date
  const epHits  = epPicks.filter(p => p.status === 'hit').length
  const epValid = epPicks.filter(p => p.status === 'hit' || p.status === 'miss').length
  const epRate  = epValid > 0 ? Math.round(epHits / epValid * 100) : null

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--bg-card)', borderColor: 'var(--border)',
        animation: `pb-fade-up 400ms cubic-bezier(0.22,1,0.36,1) ${epIdx * 55}ms both`,
        transition: 'box-shadow 200ms, transform 200ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
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
            p.status === 'pending' ? 'var(--yellow)'     : 'var(--border-dim)'

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
              style={{ borderLeft: `3px solid ${resultColor}`, transition: 'background 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '' }}
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
                  style={{
                    color: resultColor, background: resultBg,
                    animation: p.status !== 'no_data'
                      ? `pb-badge-pop 400ms cubic-bezier(0.34,1.56,0.64,1) ${epIdx * 55 + i * 30 + 200}ms both`
                      : undefined,
                  }}
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

              {/* 播出基準 + Bullet bars */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono shrink-0" style={{ width: 30, fontSize: 10, textAlign: 'right', color: 'var(--fg-dim)' }}>播出</span>
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--fg-muted)' }}>
                    {p.ep_price ?? '─'}
                  </span>
                  <span className="font-mono" style={{ fontSize: 9, color: 'var(--fg-dim)' }}>
                    {fmtDate(p.ep_date_actual)}
                  </span>
                </div>
                <BulletRow label="D+1"  pct={p.d1_pct}  date={p.d1_date}  delay={epIdx * 55 + i * 25 + 50} />
                <BulletRow label="D+7"  pct={p.d7_pct}  date={p.d7_date}  delay={epIdx * 55 + i * 25 + 150} />
                <BulletRow label="D+14" pct={p.d14_pct} date={p.d14_date} delay={epIdx * 55 + i * 25 + 250} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── PicksBoard ────────────────────────────────────────────────────────────────
export default function PicksBoard({ data }: Props) {
  useStyleOnce()
  const { stats, picks } = data
  const [filter, setFilter] = useState<'all' | 'hit' | 'miss' | 'pending'>('all')
  const [filterKey, setFilterKey] = useState(0)

  const filtered = picks.filter(p => {
    if (filter === 'all') return p.status !== 'no_data'
    return p.status === filter
  })

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

  function handleFilter(f: typeof filter) {
    setFilter(f)
    setFilterKey(k => k + 1)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* 標題 */}
      <div style={{ animation: 'pb-fade-up 400ms ease-out both' }}>
        <h1 className="font-mono font-bold text-lg" style={{ color: 'var(--fg)' }}>
          主委選股成績單
        </h1>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>
          驗證：正面/負面立場 → 比較播出日、D+1、D+7、D+14 收盤漲跌。勝率以次日（D+1）為準。
        </p>
      </div>

      {/* 統計：甜甜圈 + 數字 */}
      <div
        className="rounded-xl border p-4 flex items-center gap-5"
        style={{
          background: 'var(--bg-card)', borderColor: 'var(--border)',
          animation: 'pb-fade-up 450ms ease-out 60ms both',
        }}
      >
        <WinRateDonut
          hits={stats.hits} misses={stats.misses} pending={stats.pending}
          winRate={stats.win_rate} winRateColor={winRateColor}
        />
        <div className="flex flex-col gap-2.5 flex-1 font-mono">
          {[
            { v: stats.hits,    color: 'var(--stance-pos)', label: '命中' },
            { v: stats.misses,  color: 'var(--stance-neg)', label: '失準' },
            ...(stats.pending > 0 ? [{ v: stats.pending, color: 'var(--yellow)', label: '等待中' }] : []),
          ].map((row, i) => (
            <div key={row.label} className="flex items-center gap-2"
              style={{ animation: `pb-fade-up 350ms ease-out ${120 + i * 80}ms both` }}>
              <span className="text-sm" style={{ color: row.color }}>●</span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{row.label}</span>
              <span className="font-bold text-base ml-auto" style={{ color: row.color }}>{row.v}</span>
            </div>
          ))}
          <div className="pt-2 flex justify-between text-xs"
            style={{
              borderTop: '1px solid var(--border-dim)', color: 'var(--fg-dim)',
              animation: 'pb-fade-up 350ms ease-out 400ms both',
            }}>
            <span>{stats.valid} 筆有效</span>
            <span>共 {stats.total} 筆</span>
          </div>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'hit', 'miss', 'pending'] as const).map((f, i) => {
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
              onClick={() => handleFilter(f)}
              className="text-xs px-3 py-1 rounded-full border font-mono cursor-pointer"
              style={{
                background: active ? c.bg : 'transparent',
                borderColor: active ? c.border : 'var(--border-dim)',
                color: active ? c.fg : 'var(--fg-dim)',
                transition: 'background 150ms, border-color 150ms, color 150ms',
                animation: `pb-fade-up 300ms ease-out ${500 + i * 50}ms both`,
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

      {/* 集數分組卡片：手機單欄 */}
      <div className="flex flex-col gap-4 lg:hidden">
        {episodes.map((ep, epIdx) => (
          <EpCard key={`${filterKey}-${ep}`} ep={ep} epPicks={byEpisode[ep]} epIdx={epIdx} />
        ))}
      </div>

      {/* 集數分組卡片：桌機手動奇偶兩欄（避免 grid 高度對齊產生空白）*/}
      <div className="hidden lg:flex gap-4 items-start">
        <div className="flex flex-col gap-4 flex-1">
          {episodes.filter((_, i) => i % 2 === 0).map((ep, colIdx) => (
            <EpCard key={`${filterKey}-${ep}`} ep={ep} epPicks={byEpisode[ep]} epIdx={colIdx * 2} />
          ))}
        </div>
        <div className="flex flex-col gap-4 flex-1">
          {episodes.filter((_, i) => i % 2 === 1).map((ep, colIdx) => (
            <EpCard key={`${filterKey}-${ep}`} ep={ep} epPicks={byEpisode[ep]} epIdx={colIdx * 2 + 1} />
          ))}
        </div>
      </div>

      {/* 底部說明 */}
      <p className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
        * 播出日收盤為基準；D+1/D+7/D+14 為相對漲跌幅。勝率以 D+1 方向為準。觀察/中立立場不計入。
      </p>
    </div>
  )
}
