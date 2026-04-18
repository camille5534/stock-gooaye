import { Episode } from '@/lib/types'
import QASearch from '@/components/QASearch'
import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'

async function getAllQA() {
  const dir   = path.join(process.cwd(), 'public', 'data', 'episodes')
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json')).sort().reverse()

  const allQA = []
  for (const file of files) {
    const ep: Episode = JSON.parse(await fs.readFile(path.join(dir, file), 'utf-8'))
    for (const qa of ep.qa) {
      allQA.push({ ...qa, episode: ep.episode, date: ep.date })
    }
  }
  return allQA
}

export default async function QAPage() {
  const allQA = await getAllQA()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b px-4 py-2.5"
        style={{ background: 'rgba(2,6,23,0.92)', borderColor: 'var(--border)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono transition-colors duration-100 cursor-pointer"
              style={{ color: 'var(--fg-muted)' }}
            >
              ← 返回看板
            </Link>
            <span style={{ color: 'var(--border)' }}>│</span>
            <span className="font-mono font-bold text-sm" style={{ color: 'var(--fg)' }}>
              ▐ Q&amp;A 精華庫 ▌
            </span>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
            累計 {allQA.length} 則
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">
        {/* Sub header */}
        <div
          className="rounded-lg border px-4 py-3 mb-4 flex items-center gap-3"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <span className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
            搜尋謝孟恭歷年回答 · 依 EP、標的、關鍵字即時過濾
          </span>
        </div>

        <QASearch allQA={allQA} />
      </main>
    </div>
  )
}
