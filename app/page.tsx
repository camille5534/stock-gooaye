import { Episode, VixData, StockHistory } from '@/lib/types'
import VixGauge from '@/components/VixGauge'
import SentimentBar from '@/components/SentimentBar'
import StockTable from '@/components/StockTable'
import KeywordCloud from '@/components/KeywordCloud'
import HistoryChart from '@/components/HistoryChart'
import StockRanking from '@/components/StockRanking'
import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'

async function getData() {
  const dataDir = path.join(process.cwd(), 'public', 'data')

  // 找最新一集（檔名排序最大的）
  const epDir = path.join(dataDir, 'episodes')
  const files = (await fs.readdir(epDir)).filter(f => f.endsWith('.json')).sort().reverse()
  const latestFile = files[0]

  const [epRaw, vixRaw, histRaw] = await Promise.all([
    fs.readFile(path.join(epDir, latestFile), 'utf-8'),
    fs.readFile(path.join(dataDir, 'vix.json'), 'utf-8'),
    fs.readFile(path.join(dataDir, 'stock_history.json'), 'utf-8'),
  ])

  const episode: Episode = JSON.parse(epRaw)
  const vix: VixData = JSON.parse(vixRaw)
  const history: StockHistory = JSON.parse(histRaw)
  return { episode, vix, history }
}

export default async function Home() {
  const { episode, vix, history } = await getData()

  const vixVsSentiment = (() => {
    if (vix.current > 30 && episode.sentiment.bull_pct >= 55)
      return { msg: '⚠ VIX 恐慌但股癌偏多，注意反差訊號', color: 'text-orange-400' }
    if (vix.current < 20 && episode.sentiment.bear_pct >= 55)
      return { msg: '⚠ 市場貪婪但股癌偏空，留意風險', color: 'text-orange-400' }
    return { msg: '多空訊號一致', color: 'text-gray-400' }
  })()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight">▐ 股癌雷達 ▌</span>
            <span className="text-gray-500 text-sm">{episode.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
            <span className="text-gray-500 text-xs">{episode.date}</span>
            <Link
              href="/qa"
              className="text-xs px-3 py-1 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Q&amp;A 精華
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VixGauge vix={vix} />
          <SentimentBar
            score={episode.sentiment.score}
            label={episode.sentiment.label}
            bull_pct={episode.sentiment.bull_pct}
            bear_pct={episode.sentiment.bear_pct}
          />
          <KeywordCloud keywords={episode.keywords} />
        </div>

        <div className="text-center">
          <span className={`text-sm ${vixVsSentiment.color}`}>{vixVsSentiment.msg}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <h2 className="text-gray-400 text-sm font-medium tracking-wider uppercase mb-3">本集提到標的</h2>
            <StockTable stocks={episode.stocks} />
          </div>
          <div>
            <h2 className="text-gray-400 text-sm font-medium tracking-wider uppercase mb-3">歷史排行</h2>
            <StockRanking rankings={history.rankings} />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h2 className="text-gray-400 text-sm font-medium tracking-wider uppercase mb-2">本集摘要</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{episode.summary}</p>
        </div>

        <HistoryChart history={history} />
      </main>
    </div>
  )
}
