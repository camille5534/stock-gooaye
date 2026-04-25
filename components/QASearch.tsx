'use client'

import { useState, useMemo } from 'react'
import { QAItem } from '@/lib/types'

interface QAWithEp extends QAItem {
  episode: number
  date: string
  youtube_url: string
}

function toYoutubeLink(url: string, timestamp: string): string {
  if (!url || !timestamp) return url
  const [h, m, s] = timestamp.split(':').map(Number)
  const secs = (h || 0) * 3600 + (m || 0) * 60 + (s || 0)
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}t=${secs}`
}

interface Props { allQA: QAWithEp[] }

export default function QASearch({ allQA }: Props) {
  const [query, setQuery]         = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeEp, setActiveEp]   = useState<number | null>(null)
  const [showAllTags, setShowAllTags] = useState(false)

  const TAG_LIMIT = 12

  const allTags = useMemo(() => {
    const set = new Set<string>()
    allQA.forEach(qa => qa.tags.forEach(t => set.add(t)))
    return Array.from(set)
  }, [allQA])

  const allEps = useMemo(() => {
    const set = new Set<number>()
    allQA.forEach(qa => set.add(qa.episode))
    return Array.from(set).sort((a, b) => b - a)
  }, [allQA])

  const filtered = useMemo(() =>
    allQA.filter(qa => {
      const q = query.toLowerCase()
      const matchQ = !q || qa.question.toLowerCase().includes(q) ||
                         qa.answer.toLowerCase().includes(q) ||
                         qa.tags.some(t => t.toLowerCase().includes(q))
      return matchQ && (!activeTag || qa.tags.includes(activeTag)) && (!activeEp || qa.episode === activeEp)
    }),
    [allQA, query, activeTag, activeEp]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs select-none"
          style={{ color: '#22D3EE' }}
        >
          &gt;_
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜尋問題、回答、股票代號..."
          className="w-full rounded-lg border pl-10 pr-10 py-3 text-sm font-mono focus:outline-none transition-colors duration-150"
          style={{
            background: 'var(--bg-card)',
            borderColor: query ? '#22D3EE' : 'var(--border)',
            color: 'var(--fg)',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors duration-100 cursor-pointer"
            style={{ color: 'var(--fg-dim)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}
          >
            ✕
          </button>
        )}
      </div>

      {/* EP filter chips */}
      <div className="flex gap-1.5 flex-wrap items-center">
        <span className="text-xs font-mono shrink-0" style={{ color: 'var(--fg-dim)' }}>集數</span>
        <button
          onClick={() => setActiveEp(null)}
          className="text-xs px-2.5 py-0.5 rounded-full border transition-colors duration-100 cursor-pointer font-mono"
          style={{
            background: !activeEp ? 'rgba(168,85,247,0.10)' : 'transparent',
            borderColor: !activeEp ? '#A855F7' : 'var(--border)',
            color: !activeEp ? '#A855F7' : 'var(--fg-dim)',
          }}
        >
          全部
        </button>
        {allEps.map(ep => (
          <button
            key={ep}
            onClick={() => setActiveEp(activeEp === ep ? null : ep)}
            className="text-xs px-2.5 py-0.5 rounded-full border transition-colors duration-100 cursor-pointer font-mono"
            style={{
              background: activeEp === ep ? 'rgba(168,85,247,0.10)' : 'transparent',
              borderColor: activeEp === ep ? '#A855F7' : 'var(--border)',
              color: activeEp === ep ? '#A855F7' : 'var(--fg-dim)',
            }}
          >
            EP{ep}
          </button>
        ))}
      </div>

      {/* Tag chips */}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-mono shrink-0" style={{ color: 'var(--fg-dim)' }}>標籤</span>
          <button
            onClick={() => setActiveTag(null)}
            className="text-xs px-3 py-1 rounded-full border transition-colors duration-100 cursor-pointer"
            style={{
              background: !activeTag ? 'rgba(34,211,238,0.08)' : 'transparent',
              borderColor: !activeTag ? '#22D3EE' : 'var(--border)',
              color: !activeTag ? '#22D3EE' : 'var(--fg-muted)',
            }}
          >
            全部
          </button>
          {(showAllTags ? allTags : allTags.slice(0, TAG_LIMIT)).map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className="text-xs px-3 py-1 rounded-full border transition-colors duration-100 cursor-pointer"
              style={{
                background: activeTag === tag ? 'rgba(34,211,238,0.08)' : 'transparent',
                borderColor: activeTag === tag ? '#22D3EE' : 'var(--border)',
                color: activeTag === tag ? '#22D3EE' : 'var(--fg-muted)',
              }}
            >
              #{tag}
            </button>
          ))}
          {/* 選中的 tag 若在收起區，單獨顯示 */}
          {!showAllTags && activeTag && !allTags.slice(0, TAG_LIMIT).includes(activeTag) && (
            <button
              onClick={() => setActiveTag(null)}
              className="text-xs px-3 py-1 rounded-full border transition-colors duration-100 cursor-pointer"
              style={{
                background: 'rgba(34,211,238,0.08)',
                borderColor: '#22D3EE',
                color: '#22D3EE',
              }}
            >
              #{activeTag}
            </button>
          )}
          {/* 展開／收起按鈕 */}
          {allTags.length > TAG_LIMIT && (
            <button
              onClick={() => setShowAllTags(v => !v)}
              className="text-xs px-2.5 py-1 rounded-full border transition-colors duration-100 cursor-pointer font-mono"
              style={{ borderColor: 'var(--border-dim)', color: 'var(--fg-dim)', borderStyle: 'dashed' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}
            >
              {showAllTags ? '收起 ↑' : `+${allTags.length - TAG_LIMIT} 更多 ↓`}
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
        {filtered.length} / {allQA.length} 則
        {activeEp && <span style={{ color: '#A855F7' }}> · EP{activeEp}</span>}
        {activeTag && <span style={{ color: '#22D3EE' }}> · #{activeTag}</span>}
        {query && <span style={{ color: '#22D3EE' }}> · 「{query}」</span>}
      </p>

      {/* Q&A Cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div
            className="text-center py-16 rounded-lg border"
            style={{ color: 'var(--fg-dim)', background: 'var(--bg-card)', borderColor: 'var(--border-dim)' }}
          >
            <p className="font-mono text-sm">找不到相關 Q&amp;A</p>
            <p className="text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>換個關鍵字試試</p>
          </div>
        ) : (
          filtered.map(qa => (
            <div
              key={qa.id}
              className="rounded-lg border overflow-hidden"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              {/* Q */}
              <div
                className="px-4 py-3 flex items-start gap-3"
                style={{ borderBottom: '1px solid var(--border-dim)' }}
              >
                <span
                  className="font-mono font-bold text-sm mt-0.5 shrink-0 w-5 text-center"
                  style={{ color: '#22D3EE' }}
                >
                  Q
                </span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--fg)' }}>
                  {qa.question}
                </p>
              </div>

              {/* A */}
              <div
                className="px-4 py-3 flex items-start gap-3"
                style={{ background: 'rgba(249,115,22,0.03)', borderBottom: '1px solid var(--border-dim)' }}
              >
                <span
                  className="font-mono font-bold text-sm mt-0.5 shrink-0 w-5 text-center"
                  style={{ color: '#F97316' }}
                >
                  A
                </span>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--fg-muted)' }}>
                  {qa.answer}
                </p>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 flex items-center justify-between gap-2">
                <div className="flex gap-1.5 flex-wrap">
                  {qa.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className="text-xs px-1.5 py-0.5 rounded transition-colors duration-100 cursor-pointer"
                      style={{ color: 'var(--fg-dim)', background: 'var(--border-dim)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {qa.youtube_url && qa.timestamp && (
                    <a
                      href={toYoutubeLink(qa.youtube_url, qa.timestamp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono px-2 py-0.5 rounded transition-colors duration-100"
                      style={{ color: 'var(--fg-dim)', background: 'var(--border-dim)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-dim)')}
                    >
                      ▶ {qa.timestamp}
                    </a>
                  )}
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{
                      color: '#22D3EE',
                      background: 'rgba(34,211,238,0.08)',
                      border: '1px solid rgba(34,211,238,0.25)',
                    }}
                    title={qa.date}
                  >
                    EP{qa.episode}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
