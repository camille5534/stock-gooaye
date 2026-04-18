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
}

export interface VixData {
  current: number
  updated_at: string
  zone: 'greed' | 'neutral' | 'fear' | 'panic'
  history: { date: string; value: number }[]
}

export interface StockHistory {
  rankings: { code: string; name: string; count: number }[]
  sentiment_history: {
    ep: number
    date: string
    score: number
    vix: number
  }[]
}
