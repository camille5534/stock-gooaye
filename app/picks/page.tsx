import AppHeader from '@/components/AppHeader'
import PicksTrend from '@/components/PicksTrend'
import PicksBoard from '@/components/PicksBoard'
import { promises as fs } from 'fs'
import path from 'path'

async function getData() {
  const [picksRaw, predsRaw] = await Promise.all([
    fs.readFile(path.join(process.cwd(), 'public', 'data', 'stock_picks.json'), 'utf-8'),
    fs.readFile(path.join(process.cwd(), 'public', 'data', 'predictions.json'), 'utf-8'),
  ])
  return {
    picks: JSON.parse(picksRaw),
    preds: JSON.parse(predsRaw),
  }
}

export default async function PicksPage() {
  const { picks, preds } = await getData()
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AppHeader
        rightSlot={
          <div
            className="hidden sm:flex flex-col items-end font-mono text-xs whitespace-nowrap"
            style={{ color: 'var(--fg-muted)' }}
          >
            <span>更新 {picks.generated_at}</span>
            <span style={{ color: 'var(--fg-dim)', fontSize: '10px' }}>每日 15:00 自動更新</span>
          </div>
        }
      />
      <main className="max-w-5xl mx-auto px-4 py-5 flex flex-col gap-8">
        <PicksBoard data={preds} />
        <PicksTrend data={picks} />
      </main>
    </div>
  )
}
