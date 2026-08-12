import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CategoryId, SizeBucket } from '@/data/patterns'
import { CATEGORIES, SIZE_LABEL } from '@/data/patterns'
import { cn } from '@/lib/utils'

export type SortKey = 'popular' | 'newest' | 'fewest'

export interface PatternFilter {
  category: CategoryId | 'all'
  /** 0 = 不限；N = 难度 ≤ N */
  maxDifficulty: number
  size: SizeBucket | 'all'
  sort: SortKey
  query: string
}

export const DEFAULT_FILTER: PatternFilter = {
  category: 'all',
  maxDifficulty: 0,
  size: 'all',
  sort: 'popular',
  query: '',
}

export function activeFilterCount(f: PatternFilter): number {
  let n = 0
  if (f.category !== 'all') n++
  if (f.maxDifficulty > 0) n++
  if (f.size !== 'all') n++
  if (f.query.trim() !== '') n++
  return n
}

interface FilterBarProps {
  filter: PatternFilter
  onChange: (f: PatternFilter) => void
}

const selectCls =
  'h-9 cursor-pointer rounded-full border border-ash/40 bg-bead-white px-3.5 pr-8 text-sm font-bold text-ink outline-none transition-colors focus:border-cherry appearance-none bg-no-repeat'

const chevronBg = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8177' stroke-width='3'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundPosition: 'right 12px center',
} as const

/** 吸顶筛选工具栏：分类 chips + 难度豆选 + 尺寸/排序 Select + 搜索 */
export default function FilterBar({ filter, onChange }: FilterBarProps) {
  const set = (patch: Partial<PatternFilter>) => onChange({ ...filter, ...patch })
  const active = activeFilterCount(filter)

  return (
    <div className="rounded-card bg-bead-white p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* 分类 chips */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => set({ category: c.id })}
              className={cn(
                'h-9 rounded-full border px-4 text-sm font-bold transition-all duration-200',
                filter.category === c.id
                  ? 'border-yolk bg-yolk text-ink shadow-[inset_0_-3px_0_rgba(0,0,0,.12)]'
                  : 'border-ash/30 bg-transparent text-ink/70 hover:border-yolk hover:text-ink',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* 难度豆选 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ash">难度</span>
          <div className="flex items-center gap-1" role="radiogroup" aria-label="难度筛选">
            {Array.from({ length: 5 }).map((_, i) => {
              const level = i + 1
              const selected = filter.maxDifficulty >= level
              return (
                <button
                  key={level}
                  type="button"
                  title={`难度 ≤ ${level}`}
                  onClick={() => set({ maxDifficulty: filter.maxDifficulty === level ? 0 : level })}
                  className="p-0.5 transition-transform hover:scale-125"
                >
                  <svg viewBox="0 0 10 10" className="h-3.5 w-3.5">
                    <circle cx="5" cy="5" r="4.4" fill={selected ? '#E8452C' : '#E5DDCE'} />
                    {selected && <ellipse cx="3.6" cy="3.4" rx="1.4" ry="0.9" fill="#fff" opacity="0.7" />}
                  </svg>
                </button>
              )
            })}
          </div>
        </div>

        {/* 尺寸 / 排序 */}
        <div className="flex items-center gap-2.5">
          <select
            value={filter.size}
            onChange={(e) => set({ size: e.target.value as SizeBucket | 'all' })}
            className={selectCls}
            style={chevronBg}
            aria-label="尺寸筛选"
          >
            <option value="all">全部尺寸</option>
            <option value="small">{SIZE_LABEL.small}</option>
            <option value="standard">{SIZE_LABEL.standard}</option>
            <option value="large">{SIZE_LABEL.large}</option>
          </select>
          <select
            value={filter.sort}
            onChange={(e) => set({ sort: e.target.value as SortKey })}
            className={selectCls}
            style={chevronBg}
            aria-label="排序方式"
          >
            <option value="popular">最受欢迎</option>
            <option value="newest">最新</option>
            <option value="fewest">用豆最少</option>
          </select>
        </div>

        {/* 搜索 */}
        <div className="relative ml-auto">
          <svg
            viewBox="0 0 16 16"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="7" height="7" fill="none" stroke="#8A8177" strokeWidth="2" />
            <rect x="10" y="10" width="2" height="2" fill="#8A8177" />
            <rect x="12" y="12" width="2" height="2" fill="#8A8177" />
          </svg>
          <input
            value={filter.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="搜索图案…"
            className="h-9 w-44 rounded-full border border-ash/40 bg-bead-white pl-9 pr-3 text-sm font-bold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ash/70 focus:border-cherry"
          />
        </div>
      </div>

      {/* 已选筛选提示条 */}
      <AnimatePresence initial={false}>
        {active > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center gap-3 border-t border-dashed border-ash/30 pt-3 text-sm">
              <span className="font-bold text-ink/70">
                已选筛选 <span className="font-mono text-cherry">×{active}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange({ ...DEFAULT_FILTER, sort: filter.sort })}
                className="inline-flex items-center gap-1 rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink/70 transition-colors hover:bg-cherry hover:text-white"
              >
                <X size={12} /> 清除
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
