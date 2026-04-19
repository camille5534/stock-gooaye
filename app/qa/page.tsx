import { Episode } from '@/lib/types'
import QASearch from '@/components/QASearch'
import AppHeader from '@/components/AppHeader'
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
      <AppHeader
        rightSlot={
          <span className="text-xs font-mono" style={{ color: 'var(--fg-muted)' }}>
            累計 {allQA.length} 則
          </span>
        }
      />

      <main className="max-w-3xl mx-auto px-4 py-5">
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
