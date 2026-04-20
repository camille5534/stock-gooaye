export interface SectorMention {
  name: string
  stance: '正面' | '負面' | '中立' | '觀察'
  intensity: 1 | 2 | 3
  stocks: string[]
  quote: string
}

export interface SectorConfig {
  core: string[]
  active_threshold: number
  archive_threshold: number
  sector_stocks: Record<string, string[]>
}

export interface SectorHistory {
  [sectorName: string]: {
    ep: number
    date: string
    stance: '正面' | '負面' | '中立' | '觀察'
    intensity: 1 | 2 | 3
    quote?: string
  }[]
}

export interface Stock {
  code: string
  name: string
  stance: '正面' | '負面' | '中立' | '觀察'
  stance_score: number
  quote: string
  timestamp: string
  tags: string[]
  price?: number
  change_pct?: number
}

export interface QAItem {
  id: string
  question: string
  answer: string
  timestamp: string
  tags: string[]
}

export interface Episode {
  episode: number
  date: string
  title: string
  youtube_url: string
  summary: string
  sentiment: {
    score: number
    label: string
    bull_pct: number
    bear_pct: number
  }
  keywords: string[]
  stocks: Stock[]
  qa: QAItem[]
  sectors: SectorMention[]
}

export interface VixData {
  current: number
  updated_at: string
  zone: 'greed' | 'neutral' | 'fear' | 'panic'
  history: { date: string; value: number }[]
}

export interface StockHistory {
  rankings: { code: string; name: string; count: number; episodes: number[] }[]
  sentiment_history: {
    episode: number
    date: string
    score: number
    label: string
    bull_pct: number
    bear_pct: number
    vix?: number
  }[]
}
