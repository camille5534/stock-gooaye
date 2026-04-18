# 股癌雷達 — 架構文件

> 這份文件說明整個專案的技術架構、資料流、元件結構與操作方式。
> 修改任何部分前請先讀這份文件，確認不影響整體設計。

---

## 專案目的

將股癌謝孟恭的 Podcast 內容結構化，搭配即時市場數據（VIX、台股股價），
做成可視化的投資參考看板，部署在 Vercel 上對外公開。

---

## Tech Stack

| 層次 | 工具 | 說明 |
|------|------|------|
| 前端框架 | Next.js 16 (App Router) | Vercel 原生支援，靜態生成 |
| 樣式 | Tailwind CSS v4 | utility-first，深色主題 |
| 圖表 | Recharts | VIX 與情緒歷史折線圖 |
| 圖示 | lucide-react | 輕量 icon |
| UI 風格 | 深色交易室風格 (Dark Trading Terminal) | 設計主軸 |
| 資料儲存 | JSON 檔案放在 /public/data/ | 無後端，純靜態 |
| 部署 | Vercel (GitHub 自動部署) | push main 自動更新 |

---

## 資料流

```
【每集更新流程】（手動觸發，執行兩個指令）

1. /gooaye 最新一集
   │
   ├── YouTube API 搜尋影片 → 取得 videoId
   ├── notebooklm source add → 取得 source_id
   ├── 儲存 source_id 到 D:/Project/skool-course/gooaye/{EP}_sourceid.txt
   ├── notebooklm generate report (briefing-doc) → 下載 report.md
   └── notebooklm source fulltext → 下載 {EP}_逐字稿.md

2. /stock-analyze EP648
   │
   ├── 讀取 {EP}_sourceid.txt
   ├── notebooklm generate report（股票分析 prompt）→ stocks.md
   ├── notebooklm generate report（Q&A 擷取 prompt）→ qa.md
   ├── curl Yahoo Finance → VIX 即時值
   ├── curl Yahoo Finance → 本集提到股票的現價
   ├── Claude 讀取 stocks.md + qa.md → 整合成 ep_648.json
   ├── 更新 vix.json 與 stock_history.json
   └── git push → Vercel 自動部署
```

---

## 目錄結構

```
stock-gooaye/
│
├── app/
│   ├── layout.tsx          全域 layout（字體、metadata）
│   ├── page.tsx            主看板頁面（Server Component，讀 JSON）
│   ├── globals.css         全域樣式
│   └── qa/
│       └── page.tsx        Q&A 搜尋頁面（讀所有 ep_*.json）
│
├── components/
│   ├── VixGauge.tsx        VIX 恐慌指數儀表（進度條 + 數值）
│   ├── SentimentBar.tsx    多空情緒條（10格方塊 + 百分比）
│   ├── KeywordCloud.tsx    關鍵字雲（大小與顏色漸層）
│   ├── StockTable.tsx      本集股票列表（可展開查看原文引述）
│   ├── StockRanking.tsx    歷史提及次數排行榜
│   ├── HistoryChart.tsx    VIX × 股癌情緒歷史折線圖（Recharts）
│   └── QASearch.tsx        Q&A 搜尋介面（Client Component）
│
├── lib/
│   └── types.ts            TypeScript 型別定義（Episode, VixData 等）
│
├── public/
│   └── data/
│       ├── episodes/
│       │   ├── ep_648.json     每集分析結果（格式見下）
│       │   └── ep_647.json
│       ├── vix.json            VIX 即時值 + 8週歷史
│       └── stock_history.json  股票歷史排行 + 情緒歷史
│
├── ARCHITECTURE.md         ← 本文件
└── package.json
```

---

## 資料格式

### `ep_XXX.json`

```json
{
  "episode": 648,
  "date": "2026-04-15",
  "title": "EP648 | 鴨子划水",
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "summary": "本集摘要文字...",
  "sentiment": {
    "score": 6,        // 1-10，6以上=偏多
    "label": "偏多",
    "bull_pct": 60,    // 多方百分比
    "bear_pct": 40
  },
  "keywords": ["AI", "半導體", "升息"],
  "stocks": [
    {
      "code": "2330",
      "name": "台積電",
      "stance": "正面",      // 正面 / 負面 / 中立 / 觀察
      "stance_score": 1,     // 1=正面, -1=負面, 0=中立
      "quote": "「原文引述」",
      "timestamp": "00:42:30",
      "tags": ["AI", "半導體"],
      "price": 870,          // Yahoo Finance 即時（可選）
      "change_pct": 1.2      // 漲跌幅（可選）
    }
  ],
  "qa": [
    {
      "id": "648_1",
      "question": "聽眾提問",
      "answer": "「謝孟恭回答」",
      "timestamp": "00:42:30",
      "tags": ["台積電", "進場時機"]
    }
  ]
}
```

### `vix.json`

```json
{
  "current": 37.2,
  "updated_at": "2026-04-18T09:00:00+08:00",
  "zone": "panic",    // greed / neutral / fear / panic
  "history": [
    { "date": "2026-04-18", "value": 37.2 }
  ]
}
```

### `stock_history.json`

```json
{
  "rankings": [
    { "code": "2330", "name": "台積電", "count": 42 }
  ],
  "sentiment_history": [
    { "ep": 648, "date": "2026-04-15", "score": 6, "vix": 37.2 }
  ]
}
```

---

## 元件說明

| 元件 | 類型 | 功能 |
|------|------|------|
| `VixGauge` | Client | 顯示 VIX 數值、進度條、區間標籤 |
| `SentimentBar` | Client | 多空比例條、情緒分數點陣 |
| `KeywordCloud` | Client | 關鍵字雲，大小依序漸小 |
| `StockTable` | Client | 本集股票，點擊展開引述原文 |
| `StockRanking` | Client | 歷史提及次數橫向 bar |
| `HistoryChart` | Client | Recharts 折線圖，VIX（橘）vs 情緒（青） |
| `QASearch` | Client | 全文搜尋 + tag 篩選，讀所有集數 |

---

## 如何新增一集資料

```
1. 執行 /gooaye 最新一集
   → 產生 D:/Project/skool-course/gooaye/EP648_逐字稿.md
   → 產生 D:/Project/skool-course/gooaye/EP648_sourceid.txt

2. 執行 /stock-analyze EP648
   → 自動產生 public/data/episodes/ep_648.json
   → 自動更新 public/data/vix.json
   → 自動更新 public/data/stock_history.json
   → 自動 git push → Vercel 重新部署
```

---

## Vercel 部署設定

- **Framework**: Next.js
- **Root Directory**: `stock-gooaye/`（若是 monorepo 結構）或 repo 根目錄
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **環境變數**: 無需設定（全部靜態 JSON）
- **自動部署**: 每次 `git push origin main` 觸發

---

## 設計風格說明

- **主色調**：`gray-950` 背景，`gray-900` 卡片，`gray-700` 邊框
- **強調色**：VIX 用橘紅漸層、情緒用青色、正面股票用綠色、負面用紅色
- **字體**：Geist Sans（系統字體）+ Geist Mono（數字）
- **風格關鍵字**：Dark Trading Terminal、資訊密度高、無裝飾性元素
