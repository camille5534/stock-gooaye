'use client'

import { useState } from 'react'
import { Episode, SectorConfig, SectorHistory } from '@/lib/types'

interface Props {
  episodes: Episode[]
  config: SectorConfig
  history: SectorHistory
}

/* ── 立場設定：使用 CSS 變數，主題自動切換 ── */
const stanceCfg = {
  '正面': { icon: '▲', colorVar: '--stance-pos', bgVar: '--stance-pos-bg' },
  '負面': { icon: '▼', colorVar: '--stance-neg', bgVar: '--stance-neg-bg' },
  '中立': { icon: '─', colorVar: '--stance-neu', bgVar: '--stance-neu-bg' },
  '觀察': { icon: '◎', colorVar: '--stance-obs', bgVar: '--stance-obs-bg' },
} as const

type StanceKey = keyof typeof stanceCfg

/* A+B：強度改用色塊進度條，比點點更直覺 */
const intensityBar = (n: 1 | 2 | 3, colorVar: string) => (
  <div
    style={{
      width: '36px',
      height: '4px',
      background: 'var(--border-dim)',
      borderRadius: '3px',
      overflow: 'hidden',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: `${Math.round((n / 3) * 100)}%`,
        height: '100%',
        background: `var(${colorVar})`,
        borderRadius: '3px',
      }}
    />
  </div>
)

function getLayerStatus(
  name: string,
  history: SectorHistory,
  config: SectorConfig,
  latestEp: number,
): 'core' | 'active' | 'watching' | 'archived' {
  if (config.core.includes(name)) return 'core'
  const entries = history[name] ?? []
  if (!entries.length) return 'active'
  const lastEp = Math.max(...entries.map(e => e.ep))
  const gap = latestEp - lastEp
  if (gap === 0) return 'active'
  if (gap < config.active_threshold) return 'active'
  if (gap < config.archive_threshold) return 'watching'
  return 'archived'
}

const layerBorderVar: Record<string, string> = {
  core:     '--layer-core',
  active:   '--layer-active',
  watching: '--layer-watch',
  archived: '--border-dim',
}

/* ─────────────────────────────────────────────
   桌機列 (md+)
───────────────────────────────────────────── */
function DesktopRow({
  name, episodes, history, latestEp, layer, isEven,
}: {
  name: string
  episodes: Episode[]
  history: SectorHistory
  latestEp: number
  layer: 'core' | 'active' | 'watching' | 'archived'
  isEven: boolean
}) {
  const entries   = history[name] ?? []
  const lastEntry = entries.length ? entries[entries.length - 1] : null
  const gapEps    = lastEntry ? latestEp - lastEntry.ep : null
  const sc        = lastEntry ? (stanceCfg[lastEntry.stance as StanceKey] ?? stanceCfg['中立']) : null

  return (
    <div
      className="sector-row hidden md:flex items-stretch"
      style={{
        borderLeft: `3px solid var(${layerBorderVar[layer]})`,
        background: isEven ? 'var(--bg-card)' : 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-dim)',
        minHeight: '68px',
      }}
    >
      {/* 族群名 + quote */}
      <div className="flex flex-col justify-center gap-1 px-3 py-3 shrink-0" style={{ width: '220px' }}>
        <span className="font-mono font-bold" style={{ color: 'var(--fg)', fontSize: '14px' }}>
          {name}
        </span>
        {lastEntry?.quote && (
          <div className="flex items-start gap-1">
            <span className="font-mono shrink-0" style={{ color: 'var(--accent)', fontSize: '10px', paddingTop: '1px' }}>
              EP{lastEntry.ep}
            </span>
            <span
              className="font-mono leading-tight"
              style={{
                color: 'var(--fg-muted)', fontSize: '11px',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {lastEntry.quote}
            </span>
          </div>
        )}
      </div>

      {/* 近況 */}
      <div
        className="flex flex-col justify-center items-start gap-1.5 px-3 py-3 shrink-0"
        style={{ width: '130px', borderLeft: '1px solid var(--border-dim)' }}
      >
        {sc ? (
          <>
            <span
              className="font-mono font-bold px-2.5 py-0.5 rounded"
              style={{
                color: `var(${sc.colorVar})`,
                background: `var(${sc.bgVar})`,
                fontSize: '13px',
              }}
            >
              {sc.icon} {lastEntry!.stance}
            </span>
            <div className="flex items-center gap-2">
              {intensityBar(lastEntry!.intensity, sc.colorVar)}
              {gapEps !== null && gapEps > 0 && (
                <span style={{ color: 'var(--fg-muted)', fontSize: '10px', fontFamily: 'monospace' }}>
                  {gapEps}集前
                </span>
              )}
            </div>
          </>
        ) : (
          <span style={{ color: 'var(--fg-dim)', fontSize: '12px' }}>─</span>
        )}
      </div>

      {/* 時間軸 */}
      {episodes.map(ep => {
        const m  = ep.sectors?.find(s => s.name === name)
        const mc = m ? (stanceCfg[m.stance as StanceKey] ?? stanceCfg['中立']) : null
        return (
          <div
            key={ep.episode}
            className="flex flex-col items-center justify-center shrink-0"
            style={{ width: '66px', borderLeft: '1px solid var(--border-dim)', gap: '4px' }}
            title={m?.quote}
          >
            {mc ? (
              <>
                <span style={{ color: `var(${mc.colorVar})`, fontSize: '22px', fontFamily: 'monospace', fontWeight: 700 }}>
                  {mc.icon}
                </span>
                {intensityBar(m!.intensity, mc.colorVar)}
              </>
            ) : (
              <span style={{ color: 'var(--border-dim)', fontSize: '14px' }}>·</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   手機列 (< md)：手風琴 M1
───────────────────────────────────────────── */
function MobileRow({
  name, episodes, history, latestEp, layer, isEven, expanded, onToggle,
}: {
  name: string
  episodes: Episode[]
  history: SectorHistory
  latestEp: number
  layer: 'core' | 'active' | 'watching' | 'archived'
  isEven: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const entries   = history[name] ?? []
  const lastEntry = entries.length ? entries[entries.length - 1] : null
  const gapEps    = lastEntry ? latestEp - lastEntry.ep : null
  const sc        = lastEntry ? (stanceCfg[lastEntry.stance as StanceKey] ?? stanceCfg['中立']) : null

  return (
    <div
      className="sector-row md:hidden"
      style={{
        borderLeft: `3px solid var(${layerBorderVar[layer]})`,
        background: isEven ? 'var(--bg-card)' : 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-dim)',
      }}
    >
      {/* 折疊標題列 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-3 text-left"
        style={{ cursor: 'pointer' }}
      >
        <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-3">
          <span className="font-mono font-bold text-sm truncate" style={{ color: 'var(--fg)' }}>
            {name}
          </span>
          {lastEntry?.quote && !expanded && (
            <span className="font-mono text-xs truncate" style={{ color: 'var(--fg-muted)' }}>
              {lastEntry.quote}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sc ? (
            <span
              className="font-mono font-bold px-2 py-0.5 rounded text-xs"
              style={{ color: `var(${sc.colorVar})`, background: `var(${sc.bgVar})` }}
            >
              {sc.icon} {lastEntry!.stance}
            </span>
          ) : (
            <span style={{ color: 'var(--fg-dim)', fontSize: '12px' }}>─</span>
          )}
          {sc && intensityBar(lastEntry!.intensity, sc.colorVar)}
          {/* 箭頭 */}
          <span
            className="font-mono text-xs transition-transform duration-200"
            style={{
              color: 'var(--fg-dim)',
              display: 'inline-block',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            ▶
          </span>
        </div>
      </button>

      {/* 展開：mini 時間軸 + quote */}
      {expanded && (
        <div className="accordion-content px-3 pb-4">
          {lastEntry?.quote && (
            <div className="flex items-start gap-1 mb-3">
              <span className="font-mono shrink-0 text-xs" style={{ color: 'var(--accent)' }}>
                EP{lastEntry.ep}
              </span>
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                {lastEntry.quote}
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
              {episodes.map(ep => {
                const m  = ep.sectors?.find(s => s.name === name)
                const mc = m ? (stanceCfg[m.stance as StanceKey] ?? stanceCfg['中立']) : null
                return (
                  <div
                    key={ep.episode}
                    className="flex flex-col items-center rounded"
                    style={{
                      width: '52px',
                      padding: '6px 4px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-dim)',
                      gap: '3px',
                    }}
                  >
                    <span className="font-mono font-bold" style={{ color: 'var(--fg-dim)', fontSize: '10px' }}>
                      EP{ep.episode}
                    </span>
                    {mc ? (
                      <>
                        <span style={{ color: `var(${mc.colorVar})`, fontSize: '16px', fontFamily: 'monospace', fontWeight: 700 }}>
                          {mc.icon}
                        </span>
                        {intensityBar(m!.intensity, mc.colorVar)}
                      </>
                    ) : (
                      <span style={{ color: 'var(--border)', fontSize: '16px' }}>○</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          {gapEps !== null && gapEps > 0 && (
            <p className="font-mono text-xs mt-2" style={{ color: 'var(--fg-dim)' }}>
              距上次提及：{gapEps} 集
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 區塊（含標題）
───────────────────────────────────────────── */
function SectionBlock({
  title, titleColor, layer, sectors, episodes, history, latestEp,
  indexOffset, expandedSector, onToggle,
}: {
  title: string
  titleColor: string
  layer: 'core' | 'active' | 'watching' | 'archived'
  sectors: string[]
  episodes: Episode[]
  history: SectorHistory
  latestEp: number
  indexOffset: number
  expandedSector: string | null
  onToggle: (name: string) => void
}) {
  if (!sectors.length) return null
  return (
    <section className="flex flex-col">
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-dim)' }}
      >
        <span className="text-xs font-mono font-bold" style={{ color: titleColor }}>
          {title}
        </span>
        <span className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
          {sectors.length} 個族群
        </span>
      </div>
      {sectors.map((name, i) => {
        const isEven = (indexOffset + i) % 2 === 0
        return (
          <div key={name}>
            <DesktopRow
              name={name} episodes={episodes} history={history}
              latestEp={latestEp} layer={layer} isEven={isEven}
            />
            <MobileRow
              name={name} episodes={episodes} history={history}
              latestEp={latestEp} layer={layer} isEven={isEven}
              expanded={expandedSector === name}
              onToggle={() => onToggle(name)}
            />
          </div>
        )
      })}
    </section>
  )
}

/* ─────────────────────────────────────────────
   主組件
───────────────────────────────────────────── */
export default function SectorTimeline({ episodes, config, history }: Props) {
  const [expandedSector, setExpandedSector] = useState<string | null>(null)

  const toggle = (name: string) =>
    setExpandedSector(prev => (prev === name ? null : name))

  const sorted   = [...episodes].sort((a, b) => a.episode - b.episode)
  const recent   = sorted.slice(-8)
  const latestEp = recent[recent.length - 1]?.episode ?? 0

  const allSectors = Array.from(new Set([...config.core, ...Object.keys(history)]))
  const getStatus  = (s: string) => getLayerStatus(s, history, config, latestEp)

  const core     = allSectors.filter(s => getStatus(s) === 'core')
  const active   = allSectors.filter(s => getStatus(s) === 'active')
  const watching = allSectors.filter(s => getStatus(s) === 'watching')

  const sharedSectionProps = { episodes: recent, history, latestEp, expandedSector, onToggle: toggle }

  return (
    <div className="flex flex-col gap-4">

      {/* 桌機：完整表格 */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* 桌機表頭 */}
        <div
          className="hidden md:flex items-stretch"
          style={{ background: 'var(--bg-elevated)', borderBottom: `2px solid var(--border)` }}
        >
          <div className="flex items-center px-3 py-2 shrink-0 font-mono text-xs" style={{ width: '220px', color: 'var(--fg-muted)' }}>
            族群
          </div>
          <div className="flex items-center px-3 py-2 shrink-0 font-mono text-xs" style={{ width: '130px', borderLeft: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
            近況
          </div>
          {recent.map(ep => (
            <div
              key={ep.episode}
              className="flex flex-col items-center justify-center shrink-0 py-2"
              style={{ width: '66px', borderLeft: '1px solid var(--border)', gap: '1px' }}
            >
              <span className="font-mono font-bold text-xs" style={{ color: 'var(--fg)' }}>
                EP{ep.episode}
              </span>
              <span className="font-mono" style={{ color: 'var(--fg-dim)', fontSize: '10px' }}>
                {ep.date.slice(5)}
              </span>
            </div>
          ))}
        </div>

        {/* 手機表頭 */}
        <div
          className="md:hidden flex items-center justify-between px-3 py-2"
          style={{ background: 'var(--bg-elevated)', borderBottom: `2px solid var(--border)` }}
        >
          <span className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>族群</span>
          <span className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>近況 / 點擊展開時間軸</span>
        </div>

        <SectionBlock
          title="★ 核心追蹤" titleColor="var(--layer-core)" layer="core"
          sectors={core} indexOffset={0} {...sharedSectionProps}
        />
        <SectionBlock
          title="▌ 活躍中（近期新出現）" titleColor="var(--layer-active)" layer="active"
          sectors={active} indexOffset={core.length} {...sharedSectionProps}
        />
        <SectionBlock
          title={`◌ 觀察中（${config.active_threshold}集以上未提）`} titleColor="var(--fg-muted)" layer="watching"
          sectors={watching} indexOffset={core.length + active.length} {...sharedSectionProps}
        />
      </div>

      {/* 圖例 */}
      <div
        className="flex gap-4 flex-wrap px-3 py-2 rounded-lg"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
      >
        {(Object.entries(stanceCfg) as [StanceKey, typeof stanceCfg[StanceKey]][]).map(([label, cfg]) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-mono" style={{ color: `var(${cfg.colorVar})` }}>
            {cfg.icon} {label}
          </span>
        ))}
        <span className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
          ▌= 強度（滿格最強）　· = 本集未提
        </span>
      </div>
    </div>
  )
}
