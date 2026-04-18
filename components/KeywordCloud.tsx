'use client'

interface Props {
  keywords: string[]
}

const sizes = ['text-2xl font-bold', 'text-xl font-semibold', 'text-lg font-medium', 'text-base', 'text-sm']
const colors = [
  'text-blue-400', 'text-cyan-400', 'text-indigo-400',
  'text-purple-400', 'text-teal-400', 'text-sky-300',
]

export default function KeywordCloud({ keywords }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <span className="text-gray-400 text-sm font-medium tracking-wider uppercase block mb-3">關鍵字</span>
      <div className="flex flex-wrap gap-2 items-center justify-center min-h-[80px]">
        {keywords.map((kw, i) => (
          <span
            key={kw}
            className={`${sizes[Math.min(i, sizes.length - 1)]} ${colors[i % colors.length]} cursor-default hover:opacity-80 transition-opacity`}
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  )
}
