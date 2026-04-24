import AppHeader from '@/components/AppHeader'
import PicksBoard from '@/components/PicksBoard'
import { promises as fs } from 'fs'
import path from 'path'

async function getData() {
  const raw = await fs.readFile(
    path.join(process.cwd(), 'public', 'data', 'predictions.json'),
    'utf-8'
  )
  return JSON.parse(raw)
}

export default async function PicksPage() {
  const data = await getData()
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AppHeader
        rightSlot={
          <span className="text-xs font-mono" style={{ color: 'var(--fg-muted)' }}>
            更新：{data.generated_at}
          </span>
        }
      />
      <main className="max-w-5xl mx-auto px-4 py-5">
        <PicksBoard data={data} />
      </main>
    </div>
  )
}
