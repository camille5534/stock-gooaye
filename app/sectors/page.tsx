import { Episode, SectorConfig, SectorHistory } from '@/lib/types'
import SectorTimeline from '@/components/SectorTimeline'
import AppHeader from '@/components/AppHeader'
import { promises as fs } from 'fs'
import path from 'path'

async function getData(): Promise<{ episodes: Episode[]; config: SectorConfig; history: SectorHistory }> {
  const dataDir = path.join(process.cwd(), 'public', 'data')
  const epDir   = path.join(dataDir, 'episodes')

  const files = (await fs.readdir(epDir)).filter(f => f.endsWith('.json')).sort()
  const episodes: Episode[] = await Promise.all(
    files.map(f => fs.readFile(path.join(epDir, f), 'utf-8').then(JSON.parse))
  )

  const config: SectorConfig = JSON.parse(
    await fs.readFile(path.join(dataDir, 'sectors_config.json'), 'utf-8')
  )
  const history: SectorHistory = JSON.parse(
    await fs.readFile(path.join(dataDir, 'sector_history.json'), 'utf-8')
  )

  return { episodes, config, history }
}

export default async function SectorsPage() {
  const { episodes, config, history } = await getData()

  const totalSectors = Object.keys(history).length
  const latestEp = episodes.length ? episodes[episodes.length - 1].episode : 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AppHeader
        rightSlot={
          <span className="text-xs font-mono" style={{ color: 'var(--fg-muted)' }}>
            追蹤 {totalSectors} 族群 · EP{latestEp}
          </span>
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-5">
        <SectorTimeline episodes={episodes} config={config} history={history} />
      </main>
    </div>
  )
}
