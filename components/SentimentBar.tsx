'use client'

interface Props {
  score: number
  label: string
  bull_pct: number
  bear_pct: number
}

export default function SentimentBar({ score, label, bull_pct, bear_pct }: Props) {
  const filledBlocks = Math.round((bull_pct / 100) * 10)

  const accent =
    bull_pct >= 60 ? '#22C55E' :
    bear_pct >= 60 ? '#EF4444' :
    '#EAB308'

  const accentBg =
    bull_pct >= 60 ? 'rgba(34,197,94,0.08)' :
    bear_pct >= 60 ? 'rgba(239,68,68,0.08)' :
    'rgba(234,179,8,0.08)'

  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-3"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-muted)' }}>
          多空情緒
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded font-bold"
          style={{ color: accent, background: accentBg, border: `1px solid ${accent}44` }}
        >
          {label}
        </span>
      </div>

      {/* Score number */}
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono font-bold tabular-nums leading-none"
          style={{ fontSize: '2.75rem', color: accent }}
        >
          {score}
        </span>
        <span className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>/10</span>
      </div>

      {/* Block meter */}
      <div className="flex gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-3 rounded-sm transition-all duration-300"
            style={{
              background: i < filledBlocks
                ? accent
                : 'var(--border-dim)',
              opacity: i < filledBlocks ? 1 : 0.5,
            }}
          />
        ))}
      </div>

      {/* Bull / Bear pct */}
      <div className="flex justify-between text-xs font-mono font-medium">
        <span style={{ color: '#22C55E' }}>▲ 多 {bull_pct}%</span>
        <span style={{ color: '#EF4444' }}>▼ 空 {bear_pct}%</span>
      </div>

      {/* Divider + sub label */}
      <div className="pt-1 border-t text-xs" style={{ borderColor: 'var(--border-dim)', color: 'var(--fg-dim)' }}>
        情緒分數 {score}/10 · 本集多空評估
      </div>
    </div>
  )
}
