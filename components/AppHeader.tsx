'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeSwitcher from './ThemeSwitcher'

const tabs = [
  { href: '/',        label: '看板',    bgVar: '--tab-home-bg',   fgVar: '--tab-home-fg'   },
  { href: '/sectors', label: '族群雷達', bgVar: '--tab-sector-bg', fgVar: '--tab-sector-fg' },
  { href: '/qa',      label: 'Q&A 精華', bgVar: '--tab-qa-bg',    fgVar: '--tab-qa-fg'     },
]

interface Props {
  date?: string
  rightSlot?: React.ReactNode
}

export default function AppHeader({ date, rightSlot }: Props) {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{
        background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
        borderColor: 'var(--border-dim)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Row 1: Brand + LIVE + Date + ThemeSwitcher */}
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 pt-2.5 pb-1.5">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-sm" style={{ color: 'var(--fg)' }}>
            ▐ 生日快樂 ▌
          </span>
          <span className="flex items-center gap-1.5 text-xs font-mono">
            <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--stance-pos)' }} />
            <span style={{ color: 'var(--stance-pos)' }}>LIVE</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {rightSlot}
          {date && (
            <span className="text-xs font-mono hidden sm:block" style={{ color: 'var(--fg-muted)' }}>
              {date}
            </span>
          )}
          <ThemeSwitcher />
        </div>
      </div>

      {/* Row 2: Tab pills */}
      <div className="max-w-5xl mx-auto flex items-center gap-1.5 px-4 pb-2">
        {tabs.map(tab => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="text-sm font-mono px-4 py-1 rounded-full transition-all duration-200 cursor-pointer"
              style={
                isActive
                  ? {
                      background: `var(${tab.bgVar})`,
                      color: `var(${tab.fgVar})`,
                      fontWeight: 700,
                    }
                  : {
                      color: 'var(--fg-muted)',
                      border: '1px solid var(--border-dim)',
                    }
              }
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </header>
  )
}
