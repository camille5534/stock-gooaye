import { Episode } from '@/lib/types'
import QASearch from '@/components/QASearch'
import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'

async function getAllQA() {
  const dir = path.join(process.cwd(), 'public', 'data', 'episodes')
  const files = await fs.readdir(dir)
  const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse()

  const allQA = []
  for (const file of jsonFiles) {
    const content = await fs.readFile(path.join(dir, file), 'utf-8')
    const ep: Episode = JSON.parse(content)
    for (const qa of ep.qa) {
      allQA.push({ ...qa, episode: ep.episode, date: ep.date })
    }
  }
  return allQA
}

export default async function QAPage() {
  const allQA = await getAllQA()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
              ← 返回看板
            </Link>
            <span className="text-gray-700">|</span>
            <span className="text-white font-bold">Q&amp;A 精華庫</span>
          </div>
          <span className="text-gray-500 text-xs">累計 {allQA.length} 則</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <QASearch allQA={allQA} />
      </main>
    </div>
  )
}
