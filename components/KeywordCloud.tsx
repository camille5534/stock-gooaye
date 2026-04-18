'use client'

interface Props { keywords: string[] }

const palette = [
  '#22D3EE', '#3B82F6', '#8B5CF6', '#F97316',
  '#22C55E', '#EAB308', '#EC4899', '#94A3B8',
]

const fontSizes = [
  'text-xl font-bold',
  'text-lg font-semibold',
  'text-base font-semibold',
  'text-sm font-medium',
  'text-sm font-medium',
  'text-xs font-normal',
]

export default function KeywordCloud({ keywords }: Props) {
  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-3 h-full"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-muted)' }}>
        本集關鍵字
      </span>

      <div className="flex-1 flex flex-wrap gap-x-3 gap-y-2 items-center content-center min-h-[80px]">
        {keywords.map((kw, i) => (
          <span
            key={kw}
            className={`${fontSizes[Math.min(i, fontSizes.length - 1)]} font-mono cursor-default transition-opacity duration-150 hover:opacity-70`}
            style={{ color: palette[i % palette.length] }}
          >
            {kw}
          </span>
        ))}
      </div>

      <div className="pt-1 border-t text-xs" style={{ borderColor: 'var(--border-dim)', color: 'var(--fg-dim)' }}>
        {keywords.length} 個關鍵字
      </div>
    </div>
  )
}
