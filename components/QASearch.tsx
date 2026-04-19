'use client'

import { useState, useMemo } from 'react'
import { QAItem } from '@/lib/types'

interface QAWithEp extends QAItem {
  episode: number
  date: string
}

interface Props { allQA: QAWithEp[] }

export default function QASearch({ allQA }: Props) {
  const [query, setQuery]       = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    allQA.forEach(qa => qa.tags.forEach(t => set.add(t)))
    return Array.from(set)
  }, [allQA])

  const filtered = useMemo(() =>
    allQA.filter(qa => {
      const q = query.toLowerCase()
      const matchQ = !q || qa.question.toLowerCase().includes(q) ||
                         qa.answer.toLowerCase().includes(q) ||
                         qa.tags.some(t => t.toLowerCase().includes(q))
      return matchQ && (!activeTag || qa.tags.includes(activeTag))
    }),
    [allQA, query, activeTag]
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

      {/* Tag chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTag(null)}
          className="text-xs px-3 py-1 rounded-full border transition-colors duration-100 cursor-pointer"
          style={{
            background: !activeTag ? 'rgba(34,211,238,0.08)' : 'transparent',
            borderColor: !activeTag ? '#22D3EE' : 'var(--border)',
            color: !activeTag ? '#22D3EE' : 'var(--fg-muted)',
          }}
        >
          全部 ({allQA.length})
        </button>
        {allTags.map(tag => (
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
      </div>

      {/* Count */}
      <p className="text-xs font-mono" style={{ color: 'var(--fg-dim)' }}>
        {filtered.length} / {allQA.length} 則
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
              <div className="px-4 py-2 flex items-center justify-between">
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
                <span
                  className="text-xs font-mono shrink-0 ml-2 px-2 py-0.5 rounded"
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
          ))
        )}
      </div>
    </div>
  )
}
