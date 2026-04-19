import { Episode, VixData, StockHistory } from '@/lib/types'
import StockTable from '@/components/StockTable'
import StockRanking from '@/components/StockRanking'
import HistoryChart from '@/components/HistoryChart'
import EpisodeCard from '@/components/EpisodeCard'
import AppHeader from '@/components/AppHeader'
import { promises as fs } from 'fs'
import path from 'path'

async function getData() {
  const dataDir = path.join(process.cwd(), 'public', 'data')
  const epDir   = path.join(dataDir, 'episodes')
  const files   = (await fs.readdir(epDir)).filter(f => f.endsWith('.json')).sort().reverse()

  const [episodesRaw, vixRaw, histRaw] = await Promise.all([
    Promise.all(files.map(f => fs.readFile(path.join(epDir, f), 'utf-8'))),
    fs.readFile(path.join(dataDir, 'vix.json'), 'utf-8'),
    fs.readFile(path.join(dataDir, 'stock_history.json'), 'utf-8'),
  ])

  const episodes = episodesRaw.map(r => JSON.parse(r) as Episode)

  return {
    episodes,
    episode: episodes[0],
    vix:     JSON.parse(vixRaw) as VixData,
    history: JSON.parse(histRaw) as StockHistory,
  }
}

const vixZoneCfg = {
  greed:   { label: '貪婪',     color: '#EF4444' },
  neutral: { label: '中性',     color: '#EAB308' },
  fear:    { label: '恐慌',     color: '#F97316' },
  panic:   { label: '極度恐慌', color: '#DC2626' },
}

const sentimentIcon: Record<string, string> = {
  '偏多': '▲', '偏空': '▼', '中立': '─',
}

export default async function Home() {
  const { episodes, episode, vix, history } = await getData()

  const vcfg      = vixZoneCfg[vix.zone] ?? vixZoneCfg.neutral
  const totalQA   = episodes.reduce((s, ep) => s + ep.qa.length, 0)
  const totalStocks = episodes.reduce((s, ep) => s + ep.stocks.length, 0)

  const sentColor = episode.sentiment.label === '偏多' ? '#22C55E'
                  : episode.sentiment.label === '偏空' ? '#EF4444'
                  : '#EAB308'
  const sentBg    = episode.sentiment.label === '偏多' ? 'rgba(34,197,94,0.1)'
                  : episode.sentiment.label === '偏空' ? 'rgba(239,68,68,0.1)'
                  : 'rgba(234,179,8,0.1)'
  const sentBorder = episode.sentiment.label === '偏多' ? 'rgba(34,197,94,0.3)'
                   : episode.sentiment.label === '偏空' ? 'rgba(239,68,68,0.3)'
                   : 'rgba(234,179,8,0.3)'

  const alert = (() => {
    if (vix.current > 30 && episode.sentiment.bull_pct >= 55)
      return { msg: '⚠  VIX 恐慌但股癌偏多 — 注意反差訊號，謹慎評估風險', color: '#F97316' }
    if (vix.current < 20 && episode.sentiment.bear_pct >= 55)
      return { msg: '⚠  市場貪婪但股癌偏空 — 留意高點風險', color: '#EF4444' }
    if (vix.current > 40)
      return { msg: '⚠  VIX 極度恐慌區間 — 歷史上通常為布局機會，但需確認非系統性危機', color: '#EF4444' }
    return null
  })()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <AppHeader date={episode.date} />

      <main className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-4">

        {/* ── Alert ── */}
        {alert && (
          <div
            className="rounded-lg border px-4 py-2.5 text-sm font-mono"
            style={{ color: alert.color, background: `${alert.color}10`, borderColor: `${alert.color}44` }}
          >
            {alert.msg}
          </div>
        )}

        {/* ══ Bento Row 1：最新集 + 指標欄 + 歷史圖 ══ */}
        <div className="grid grid-cols-12 gap-4">

          {/* ── 最新集卡片 (4 col) ── */}
          <div
            className="col-span-12 md:col-span-4 rounded-xl border p-4 flex flex-col gap-3"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'rgba(34,211,238,0.3)',
              boxShadow: '0 0 24px rgba(34,211,238,0.06)',
            }}
          >
            {/* EP 標題列 */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ color: '#22D3EE', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}
                >
                  LATEST
                </span>
                <h2 className="font-mono font-bold text-2xl mt-1 glow-cyan" style={{ color: 'var(--fg)' }}>
                  EP{episode.episode}
                </h2>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--fg-dim)' }}>
                  {episode.date}
                </p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-mono font-semibold mt-1 shrink-0"
                style={{ color: sentColor, background: sentBg, border: `1px solid ${sentBorder}` }}
              >
                {sentimentIcon[episode.sentiment.label] ?? '─'} {episode.sentiment.label}
              </span>
            </div>

            {/* 摘要 */}
            <p
              className="text-sm leading-relaxed flex-1"
              style={{
                color: 'var(--fg-muted)',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {episode.summary}
            </p>

            {/* 多空比例條 */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span style={{ color: '#22C55E' }}>多 {episode.sentiment.bull_pct}%</span>
                <span className="font-bold" style={{ color: sentColor }}>
                  情緒 {episode.sentiment.score}/10
                </span>
                <span style={{ color: '#EF4444' }}>空 {episode.sentiment.bear_pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.25)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${episode.sentiment.bull_pct}%`, background: '#22C55E' }}
                />
              </div>
            </div>

            {/* 關鍵字 */}
            <div className="flex gap-1.5 flex-wrap">
              {episode.keywords.slice(0, 6).map(kw => (
                <span
                  key={kw}
                  className="text-xs px-1.5 py-0.5 rounded font-mono"
                  style={{ color: 'var(--fg-dim)', background: 'var(--border-dim)' }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* ── 指標欄 (2 col) ── */}
          <div className="col-span-6 md:col-span-2 flex flex-col gap-3">

            {/* VIX */}
            <div
              className="rounded-xl border p-3 flex flex-col gap-1 flex-1"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <span className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--fg-dim)' }}>
                VIX
              </span>
              <span className="font-mono font-bold text-2xl" style={{ color: vcfg.color }}>
                {vix.current.toFixed(2)}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-mono w-fit"
                style={{ color: vcfg.color, background: `${vcfg.color}18`, border: `1px solid ${vcfg.color}44` }}
              >
                {vcfg.label}
              </span>
              <p className="text-xs mt-1 font-mono" style={{ color: 'var(--fg-dim)' }}>
                恐慌指數
              </p>
            </div>

            {/* 情緒分 */}
            <div
              className="rounded-xl border p-3 flex flex-col gap-1 flex-1"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <span className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--fg-dim)' }}>
                情緒
              </span>
              <span className="font-mono font-bold text-2xl glow-cyan" style={{ color: '#22D3EE' }}>
                {episode.sentiment.score}
                <span className="text-sm font-normal" style={{ color: 'var(--fg-dim)' }}>/10</span>
              </span>
              <p className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
                {episodes.length} 集追蹤
              </p>
            </div>

            {/* 快速統計 */}
            <div
              className="rounded-xl border p-3 flex flex-col gap-2"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              {[
                { label: '標的', value: totalStocks },
                { label: 'Q&A', value: totalQA },
                { label: '集數', value: episodes.length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>{label}</span>
                  <span className="font-mono font-bold text-sm" style={{ color: 'var(--fg)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 歷史趨勢圖 (6 col) ── */}
          <div className="col-span-6 md:col-span-6">
            <HistoryChart history={history} />
          </div>
        </div>

        {/* ══ Row 2：本集標的 + 歷史排行 ══ */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-8 flex flex-col gap-2">
            <h2
              className="text-xs font-semibold tracking-widest uppercase px-1"
              style={{ color: 'var(--fg-muted)' }}
            >
              EP{episode.episode} 本集標的
            </h2>
            <StockTable stocks={episode.stocks} />
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
            <h2
              className="text-xs font-semibold tracking-widest uppercase px-1"
              style={{ color: 'var(--fg-muted)' }}
            >
              歷史提及排行
            </h2>
            <StockRanking rankings={history.rankings} />
          </div>
        </div>

        {/* ══ Row 3：歷史集數卡片 ══ */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-muted)' }}>
              歷史分析 · {episodes.length} 集
            </h2>
            <span className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
              共 {totalQA} 則 Q&amp;A · {totalStocks} 個標的
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes.map((ep, idx) => (
              <EpisodeCard key={ep.episode} episode={ep} isLatest={idx === 0} />
            ))}
          </div>
        </div>

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
