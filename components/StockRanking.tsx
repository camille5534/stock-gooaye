'use client'

interface Rank { code: string; name: string; count: number; episodes: number[] }
interface Props { rankings: Rank[] }

export default function StockRanking({ rankings }: Props) {
  const max = rankings[0]?.count ?? 1

  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-3 h-full"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-muted)' }}>
        歷史提及排行
      </span>

      <div className="flex flex-col gap-3">
        {rankings.map((r, i) => {
          const pct = (r.count / max) * 100
          const opacity = 1 - i * 0.12

          return (
            <div key={r.code} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-bold w-4 text-right"
                    style={{ color: i === 0 ? '#22D3EE' : 'var(--fg-dim)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs font-mono font-semibold" style={{ color: 'var(--fg)' }}>
                    {r.code}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                    {r.name}
                  </span>
                </div>
                <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--fg-dim)' }}>
                  {r.count}
                </span>
              </div>
              <div className="flex items-center gap-2 pl-6">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border-dim)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: '#22D3EE',
                      opacity,
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-1 flex-wrap pl-6">
                {r.episodes.map(ep => (
                  <span
                    key={ep}
                    className="font-mono px-1 rounded"
                    style={{ fontSize: '10px', color: 'var(--fg-dim)', background: 'var(--border-dim)' }}
                  >
                    EP{ep}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-1 border-t text-xs" style={{ borderColor: 'var(--border-dim)', color: 'var(--fg-dim)' }}>
        累計所有集數
      </div>
    </div>
  )
}
