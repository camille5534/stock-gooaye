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
  const epDir   = path.join(dataDir, 'episodes')
  const files   = (await fs.readdir(epDir)).filter(f => f.endsWith('.json')).sort().reverse()

  const [epRaw, vixRaw, histRaw] = await Promise.all([
    fs.readFile(path.join(epDir, files[0]), 'utf-8'),
    fs.readFile(path.join(dataDir, 'vix.json'), 'utf-8'),
    fs.readFile(path.join(dataDir, 'stock_history.json'), 'utf-8'),
  ])

  return {
    episode: JSON.parse(epRaw) as Episode,
    vix:     JSON.parse(vixRaw) as VixData,
    history: JSON.parse(histRaw) as StockHistory,
  }
}

export default async function Home() {
  const { episode, vix, history } = await getData()

  // VIX vs 情緒反差警示
  const alert = (() => {
    if (vix.current > 30 && episode.sentiment.bull_pct >= 55)
      return { msg: '⚠  VIX 恐慌但股癌偏多 — 注意反差訊號，謹慎評估風險', color: '#F97316', bg: 'rgba(249,115,22,0.06)' }
    if (vix.current < 20 && episode.sentiment.bear_pct >= 55)
      return { msg: '⚠  市場貪婪但股癌偏空 — 留意高點風險', color: '#EF4444', bg: 'rgba(239,68,68,0.06)' }
    if (vix.current > 40)
      return { msg: '⚠  VIX 極度恐慌區間 — 歷史上通常為布局機會，但需確認非系統性危機', color: '#EF4444', bg: 'rgba(239,68,68,0.06)' }
    return null
  })()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-10 border-b px-4 py-2.5"
        style={{ background: 'rgba(2,6,23,0.92)', borderColor: 'var(--border)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-base tracking-tight" style={{ color: 'var(--fg)' }}>
              ▐ 股癌雷達 ▌
            </span>
            <span className="text-xs px-2 py-0.5 rounded border font-mono" style={{ color: 'var(--fg-muted)', borderColor: 'var(--border-dim)' }}>
              {episode.title}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* LIVE indicator */}
            <span className="flex items-center gap-1.5 text-xs font-mono">
              <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
              <span style={{ color: '#22C55E' }}>LIVE</span>
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
              {episode.date}
            </span>
            <Link
              href="/qa"
              className="text-xs px-3 py-1.5 rounded border font-mono transition-colors duration-150 cursor-pointer"
              style={{ color: '#22D3EE', borderColor: 'rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.05)' }}
            >
              Q&amp;A 精華庫
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 flex flex-col gap-4">

        {/* ── Row 1: VIX + 情緒 + 關鍵字 ── */}
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

        {/* ── Alert banner ── */}
        {alert && (
          <div
            className="rounded-lg border px-4 py-2.5 text-sm font-mono"
            style={{ color: alert.color, background: alert.bg, borderColor: `${alert.color}44` }}
          >
            {alert.msg}
          </div>
        )}

        {/* ── Row 2: 股票列表 + 排行 ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-widest uppercase px-1" style={{ color: 'var(--fg-muted)' }}>
              本集提到標的
            </h2>
            <StockTable stocks={episode.stocks} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-widest uppercase px-1" style={{ color: 'var(--fg-muted)' }}>
              歷史提及排行
            </h2>
            <StockRanking rankings={history.rankings} />
          </div>
        </div>

        {/* ── Row 3: 本集摘要 ── */}
        <div
          className="rounded-lg border p-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--fg-muted)' }}>
            本集摘要
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            {episode.summary}
          </p>
        </div>

        {/* ── Row 4: 歷史趨勢圖 ── */}
        <HistoryChart history={history} />

        {/* ── Footer ── */}
        <div className="text-center py-4">
          <p className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
            資料來源：NotebookLM + Yahoo Finance · 僅供參考，不構成投資建議
          </p>
        </div>
      </main>
    </div>
  )
}
