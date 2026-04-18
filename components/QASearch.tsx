'use client'

import { useState, useMemo } from 'react'
import { QAItem } from '@/lib/types'

interface QAWithEp extends QAItem {
  episode: number
  date: string
}

interface Props {
  allQA: QAWithEp[]
}

export default function QASearch({ allQA }: Props) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    allQA.forEach(qa => qa.tags.forEach(t => set.add(t)))
    return Array.from(set)
  }, [allQA])

  const filtered = useMemo(() => {
    return allQA.filter(qa => {
      const matchQuery = !query ||
        qa.question.includes(query) ||
        qa.answer.includes(query) ||
        qa.tags.some(t => t.includes(query))
      const matchTag = !activeTag || qa.tags.includes(activeTag)
      return matchQuery && matchTag
    })
  }, [allQA, query, activeTag])

  return (
    <div className="space-y-4">
      {/* 搜尋框 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜尋問題、回答、股票代號..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600 text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tag 篩選 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !activeTag
              ? 'border-cyan-600 bg-cyan-950 text-cyan-400'
              : 'border-gray-700 text-gray-500 hover:border-gray-500'
          }`}
        >
          全部 ({allQA.length})
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeTag === tag
                ? 'border-cyan-600 bg-cyan-950 text-cyan-400'
                : 'border-gray-700 text-gray-500 hover:border-gray-500'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* 結果數量 */}
      <p className="text-gray-500 text-xs">
        共 {filtered.length} 則 Q&amp;A
        {query && ` (搜尋：「${query}」)`}
      </p>

      {/* Q&A 列表 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-600">找不到相關 Q&amp;A</div>
        ) : (
          filtered.map(qa => (
            <div key={qa.id} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-500 font-bold text-sm mt-0.5 shrink-0">Q</span>
                  <p className="text-white text-sm leading-relaxed">{qa.question}</p>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-800/40">
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold text-sm mt-0.5 shrink-0">A</span>
                  <p className="text-gray-300 text-sm leading-relaxed italic">{qa.answer}</p>
                </div>
              </div>
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {qa.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className="text-xs text-gray-500 bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <span className="text-gray-600 text-xs shrink-0">
                  EP{qa.episode} · {qa.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
