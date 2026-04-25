import AppHeader from '@/components/AppHeader'
import PicksTrend from '@/components/PicksTrend'
import { promises as fs } from 'fs'
import path from 'path'

async function getData() {
  const raw = await fs.readFile(
    path.join(process.cwd(), 'public', 'data', 'stock_picks.json'),
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
        <PicksTrend data={data} />
      </main>
    </div>
  )
}
