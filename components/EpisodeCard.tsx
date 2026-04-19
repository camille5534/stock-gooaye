'use client'

import { useState } from 'react'
import { Episode } from '@/lib/types'

interface Props {
  episode: Episode
  isLatest?: boolean
}

const sentimentCfg: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  '偏多': { color: '#22C55E', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  icon: '▲' },
  '偏空': { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  icon: '▼' },
  '中立': { color: '#EAB308', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.25)',  icon: '─' },
  '觀察': { color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', icon: '◎' },
}

export default function EpisodeCard({ episode, isLatest }: Props) {
  const [expanded, setExpanded] = useState(false)
  const cfg = sentimentCfg[episode.sentiment.label] ?? sentimentCfg['中立']
  const canExpand = episode.summary.length > 90

  return (
    <div
      className="rounded-xl border flex flex-col overflow-hidden transition-all duration-200 card-hover"
      style={{
        background: 'var(--bg-card)',
        borderColor: isLatest ? 'rgba(34,211,238,0.35)' : 'var(--border)',
        boxShadow: isLatest ? '0 0 20px rgba(34,211,238,0.07)' : 'none',
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-3 pb-2.5 flex items-start justify-between gap-2"
        style={{ borderBottom: '1px solid var(--border-dim)' }}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {isLatest && (
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ color: '#22D3EE', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}
              >
                LATEST
              </span>
            )}
            <span className="font-mono font-bold text-sm" style={{ color: 'var(--fg)' }}>
              EP{episode.episode}
            </span>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>{episode.date}</p>
        </div>

        <span
          className="text-xs px-1.5 py-0.5 rounded font-mono shrink-0 mt-0.5"
          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          {cfg.icon} {episode.sentiment.label}
        </span>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 flex-1">
        <p
          className="text-sm leading-relaxed"
          style={{
            color: 'var(--fg-muted)',
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: expanded ? 'visible' : 'hidden',
          }}
        >
          {episode.summary}
        </p>
        {canExpand && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs mt-1.5 transition-colors duration-100 cursor-pointer"
            style={{ color: '#22D3EE' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {expanded ? '收起 ↑' : '展開 ↓'}
          </button>
        )}
      </div>

      {/* Sentiment bar */}
      <div className="px-4 pb-2">
        <div className="flex justify-between text-xs font-mono mb-1">
          <span style={{ color: '#22C55E' }}>多 {episode.sentiment.bull_pct}%</span>
          <span className="font-bold" style={{ color: cfg.color }}>
            {episode.sentiment.score}/10
          </span>
          <span style={{ color: '#EF4444' }}>空 {episode.sentiment.bear_pct}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.2)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${episode.sentiment.bull_pct}%`, background: '#22C55E' }}
          />
        </div>
      </div>

      {/* Keywords */}
      <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
        {episode.keywords.slice(0, 5).map(kw => (
          <span
            key={kw}
            className="text-xs px-1.5 py-0.5 rounded font-mono"
            style={{ color: 'var(--fg-dim)', background: 'var(--border-dim)' }}
          >
            {kw}
          </span>
        ))}
        {episode.keywords.length > 5 && (
          <span className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
            +{episode.keywords.length - 5}
          </span>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 flex items-center justify-between text-xs font-mono"
        style={{ borderTop: '1px solid var(--border-dim)', background: 'var(--bg-elevated)' }}
      >
        <span style={{ color: 'var(--fg-dim)' }}>標的 {episode.stocks.length}</span>
        <span style={{ color: 'var(--fg-dim)' }}>Q&A {episode.qa.length}</span>
      </div>
    </div>
  )
}
