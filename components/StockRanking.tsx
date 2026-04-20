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

      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {rankings.map((r, i) => {
          const pct = (r.count / max) * 100
          const opacity = 1 - i * 0.06

          return (
            <div key={r.code} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span
                    className="font-mono font-bold shrink-0"
                    style={{ fontSize: '10px', color: i === 0 ? '#22D3EE' : 'var(--fg-dim)', width: '14px', textAlign: 'right' }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-mono font-semibold truncate" style={{ fontSize: '11px', color: 'var(--fg)' }}>
                    {r.code}
                  </span>
                </div>
                <span className="font-mono tabular-nums shrink-0" style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>
                  {r.count}
                </span>
              </div>
              <div className="h-1 rounded-full" style={{ background: 'var(--border-dim)', marginLeft: '18px' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: '#22D3EE', opacity }}
                />
              </div>
              <div className="flex gap-1 flex-wrap" style={{ marginLeft: '18px' }}>
                {r.episodes.map(ep => (
                  <span
                    key={ep}
                    className="font-mono px-1 rounded"
                    style={{ fontSize: '9px', color: 'var(--fg-dim)', background: 'var(--border-dim)' }}
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
