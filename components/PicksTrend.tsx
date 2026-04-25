'use client'

import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, ReferenceLine, Dot,
} from 'recharts'

interface Mention {
  episode: number
  date: string
  stance: string
  stance_score: number
  quote: string
  ep_price: number | null
}

interface StockEntry {
  code: string
  name: string
  ticker: string
  mentions: Mention[]
  prices: { date: string; close: number }[]
  last_mention_date: string
  last_ep_price: number | null
  current_price: number | null
  current_pct: number | null
}

interface Props {
  data: {
    generated_at: string
    active: StockEntry[]
    history: StockEntry[]
  }
}

// 立場顏色（主委意見方向，綠/紅）
const stanceColor = (score: number) =>
  score > 0 ? 'var(--stance-pos)' : score < 0 ? 'var(--stance-neg)' : 'var(--fg-dim)'

// 漲跌顏色（價格變動，藍/橙，避免與台股紅綠混淆）
const priceColor = (v: number | null) =>
  v === null ? 'var(--fg-dim)' : v > 0 ? 'var(--cyan)' : v < 0 ? 'var(--orange)' : 'var(--fg-muted)'

const fmtDate = (d: string) => d.slice(5).replace('-', '/')

const fmtPct = (v: number | null) =>
  v === null ? '─' : `${v > 0 ? '+' : ''}${v}%`

// EP pill with hover tooltip showing quote
function EpPill({ mention }: { mention: Mention }) {
  const [open, setOpen] = useState(false)
  const color = stanceColor(mention.stance_score)
  const icon = mention.stance_score > 0 ? '▲' : mention.stance_score < 0 ? '▼' : '─'

  return (
    <div className="relative" style={{ display: 'inline-block' }}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="font-mono text-xs px-2 py-1 rounded border cursor-pointer transition-colors"
        style={{
          color,
          borderColor: color,
          background: 'transparent',
          whiteSpace: 'nowrap',
        }}
      >
        {icon} EP{mention.episode} <span style={{ color: 'var(--fg-dim)' }}>{fmtDate(mention.date)}</span>
      </button>

      {open && mention.quote && (
        <div
          className="absolute z-50 rounded-lg border p-3 font-mono text-xs leading-relaxed"
          style={{
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '220px',
            maxWidth: '320px',
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}
        >
          <div className="mb-1.5" style={{ color }}>
            EP{mention.episode} · {mention.stance}
            {mention.ep_price && (
              <span style={{ color: 'var(--fg-dim)', marginLeft: '6px' }}>
                播出 {mention.ep_price}
              </span>
            )}
          </div>
          <div style={{ color: 'var(--fg-muted)' }}>{mention.quote}</div>
        </div>
      )}
    </div>
  )
}

// Custom chart tooltip
function ChartTooltip({ active, payload, mentions }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const mention = mentions.find((m: Mention) => m.date === d.date)

  return (
    <div
      className="rounded-lg border p-2.5 font-mono text-xs"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '140px',
      }}
    >
      <div style={{ color: 'var(--fg-dim)' }} className="mb-1">{d.date}</div>
      <div className="font-bold" style={{ color: 'var(--fg)', fontSize: '14px' }}>
        {d.close}
        {d.base && d.close !== d.base && (
          <span className="ml-1 text-xs font-normal" style={{ color: priceColor(d.close > d.base ? 1 : -1) }}>
            {d.close > d.base ? '▲' : '▼'}
          </span>
        )}
      </div>
      {mention && (
        <div
          className="mt-2 pt-2 leading-relaxed"
          style={{ borderTop: '1px solid var(--border-dim)', color: stanceColor(mention.stance_score) }}
        >
          <div className="font-bold mb-0.5">EP{mention.episode} · {mention.stance}</div>
          <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>{mention.quote}</div>
        </div>
      )}
    </div>
  )
}

// Custom dot: highlight EP mention dates
function CustomDot(props: any) {
  const { cx, cy, payload, mentions } = props
  const mention = mentions?.find((m: Mention) => m.date === payload?.date)
  if (!mention) return <circle cx={cx} cy={cy} r={0} />
  const color = stanceColor(mention.stance_score)
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} stroke="var(--bg-card)" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.15} />
    </g>
  )
}

function SparklineChart({ stock }: { stock: StockEntry }) {
  const { prices, mentions, last_ep_price } = stock
  if (prices.length < 2) {
    return (
      <div className="flex items-center justify-center h-16 font-mono text-xs" style={{ color: 'var(--fg-dim)' }}>
        資料不足
      </div>
    )
  }

  const minP = Math.min(...prices.map(p => p.close))
  const maxP = Math.max(...prices.map(p => p.close))
  const pad = (maxP - minP) * 0.15

  // 折線顏色用價格漲跌（藍=漲，橙=跌），不用立場顏色
  const firstClose = prices[0]?.close
  const lastClose = prices[prices.length - 1]?.close
  const lineColor = firstClose && lastClose
    ? (lastClose >= firstClose ? 'var(--cyan)' : 'var(--orange)')
    : 'var(--fg-dim)'

  return (
    <ResponsiveContainer width="100%" height={90}>
      <LineChart data={prices} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="date"
          hide
        />
        <YAxis
          domain={[minP - pad, maxP + pad]}
          hide
        />
        <Tooltip
          content={<ChartTooltip mentions={mentions} />}
          cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
        />
        {last_ep_price && (
          <ReferenceLine
            y={last_ep_price}
            stroke="var(--border)"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        )}
        <Line
          type="monotone"
          dataKey="close"
          stroke={lineColor}
          strokeWidth={2}
          dot={(props: any) => <CustomDot {...props} mentions={mentions} />}
          activeDot={{ r: 4, fill: lineColor, stroke: 'var(--bg-card)', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function StockCard({ stock }: { stock: StockEntry }) {
  const pctColor = priceColor(stock.current_pct)

  return (
    <div
      className="rounded-xl border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm" style={{ color: 'var(--fg)' }}>
            {stock.code}
          </span>
          <span className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
            {stock.name}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          {stock.current_price && (
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
              {stock.current_price}
            </span>
          )}
          <span className="font-bold text-sm" style={{ color: pctColor }}>
            {fmtPct(stock.current_pct)}
          </span>
        </div>
      </div>

      {/* EP pills */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-2">
        {stock.mentions.map((m, i) => (
          <EpPill key={`${m.episode}-${i}`} mention={m} />
        ))}
      </div>

      {/* Sparkline */}
      <div className="px-2 pb-3">
        <SparklineChart stock={stock} />
      </div>

      {/* 播出基準 */}
      {stock.last_ep_price && (
        <div className="px-4 pb-3 font-mono text-xs" style={{ color: 'var(--fg-dim)' }}>
          最後提及播出收盤 {stock.last_ep_price} · 虛線為基準
        </div>
      )}
    </div>
  )
}

export default function PicksTrend({ data }: Props) {
  const { active, history } = data
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="flex flex-col gap-5">

      {/* 標題 */}
      <div>
        <h1 className="font-mono font-bold text-lg" style={{ color: 'var(--fg)' }}>
          主委選股趨勢
        </h1>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>
          每股從第一次被提及到今天的走勢。EP 圓點 = 主委提及當天，hover 看原文。虛線 = 最後一次提及收盤。
        </p>
      </div>

      {/* Active */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
            ACTIVE
          </span>
          <span className="font-mono text-xs" style={{ color: 'var(--fg-dim)' }}>
            最新 5 集內提及 · {active.length} 支
          </span>
        </div>

        {active.length === 0 ? (
          <div className="py-8 text-center font-mono text-sm" style={{ color: 'var(--fg-dim)' }}>
            近 7 天沒有新提及
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {active.map(s => <StockCard key={s.code} stock={s} />)}
          </div>
        )}
      </div>

      {/* History toggle */}
      <div>
        <button
          onClick={() => setShowHistory(v => !v)}
          className="flex items-center gap-2 font-mono text-xs cursor-pointer"
          style={{ color: 'var(--fg-dim)' }}
        >
          <span
            className="px-2 py-0.5 rounded-full border"
            style={{ borderColor: 'var(--border-dim)' }}
          >
            {showHistory ? '▲' : '▼'} 歷史紀錄 · {history.length} 支
          </span>
        </button>

        {showHistory && (
          <div className="grid gap-3 md:grid-cols-2 mt-3">
            {history.map(s => <StockCard key={s.code} stock={s} />)}
          </div>
        )}
      </div>

      <p className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
        * 漲跌幅以最後一次提及播出日收盤為基準。觀察/中立立場不列入。
      </p>
    </div>
  )
}
