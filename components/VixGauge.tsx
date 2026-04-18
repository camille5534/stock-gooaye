'use client'

import { VixData } from '@/lib/types'

interface Props { vix: VixData }

type Zone = { label: string; color: string; glow: string; bg: string }

function getZone(v: number): Zone {
  if (v < 20) return { label: '貪婪', color: '#22C55E', glow: 'glow-green',  bg: 'rgba(34,197,94,0.08)' }
  if (v < 30) return { label: '中性', color: '#EAB308', glow: '',             bg: 'rgba(234,179,8,0.08)' }
  if (v < 40) return { label: '恐慌', color: '#F97316', glow: 'glow-orange', bg: 'rgba(249,115,22,0.08)' }
  return       { label: '極度恐慌', color: '#EF4444', glow: 'glow-red',    bg: 'rgba(239,68,68,0.08)' }
}

export default function VixGauge({ vix }: Props) {
  const zone   = getZone(vix.current)
  const needle = Math.min((vix.current / 60) * 100, 100)

  const updatedAt = new Date(vix.updated_at).toLocaleString('zh-TW', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-3"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-muted)' }}>
          VIX 恐慌指數
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded font-medium"
          style={{ color: zone.color, background: zone.bg, border: `1px solid ${zone.color}44` }}
        >
          {zone.label}
        </span>
      </div>

      {/* Main number */}
      <div className="flex items-baseline gap-2">
        <span
          className={`font-mono font-bold tabular-nums leading-none ${zone.glow}`}
          style={{ fontSize: '2.75rem', color: zone.color }}
        >
          {vix.current.toFixed(1)}
        </span>
        <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>/ 60</span>
      </div>

      {/* Gradient progress bar */}
      <div className="relative">
        {/* Track (full gradient) */}
        <div className="vix-bar-track w-full opacity-25" />
        {/* Filled portion */}
        <div
          className="vix-bar-track absolute top-0 left-0"
          style={{ width: `${needle}%` }}
        />
        {/* Needle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
          style={{ left: `${needle}%`, background: zone.color, transform: 'translate(-50%, -50%)' }}
        />
        {/* Tick marks */}
        {[20, 30, 40].map(v => (
          <div
            key={v}
            className="absolute top-0 bottom-0 w-px opacity-40"
            style={{ left: `${(v / 60) * 100}%`, background: 'var(--border)' }}
          />
        ))}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs" style={{ color: 'var(--fg-dim)' }}>
        <span>0</span>
        <span>20</span>
        <span>30</span>
        <span>40</span>
        <span>60</span>
      </div>

      {/* Footer */}
      <div className="pt-1 border-t text-xs" style={{ borderColor: 'var(--border-dim)', color: 'var(--fg-dim)' }}>
        更新 {updatedAt}
      </div>
    </div>
  )
}
