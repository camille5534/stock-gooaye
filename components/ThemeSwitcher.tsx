'use client'

import { useEffect, useState } from 'react'

type Theme = 'lavender' | 'clay' | 'charcoal'

const themes: { id: Theme; label: string; dot: string; ring: string }[] = [
  { id: 'lavender', label: '薰衣草雲', dot: '#C4B8F0', ring: '#8B7FD4' },
  { id: 'clay',     label: '陶土曙光', dot: '#EDD8CC', ring: '#B85A20' },
  { id: 'charcoal', label: '深炭',     dot: '#4A4845', ring: '#9B9890' },
]

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'lavender'
  return (localStorage.getItem('theme') as Theme) ?? 'lavender'
}

export default function ThemeSwitcher() {
  const [active, setActive] = useState<Theme>('lavender')

  useEffect(() => {
    setActive(getInitialTheme())
  }, [])

  function apply(id: Theme) {
    setActive(id)
    document.documentElement.setAttribute('data-theme', id)
    localStorage.setItem('theme', id)
  }

  return (
    <div className="flex items-center gap-1.5" title="切換主題">
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => apply(t.id)}
          title={t.label}
          className="rounded-full transition-all duration-150 cursor-pointer"
          style={{
            width: '18px',
            height: '18px',
            background: t.dot,
            outline: active === t.id ? `2px solid ${t.ring}` : '2px solid transparent',
            outlineOffset: '2px',
            transform: active === t.id ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}
