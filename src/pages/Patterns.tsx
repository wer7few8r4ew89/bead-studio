import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Brush, LayoutGrid, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BeadPattern } from '@/data/patterns'
import { PATTERNS, sizeBucket } from '@/data/patterns'
import SectionTag from '@/components/SectionTag'
import BeadButton from '@/components/BeadButton'
import FilterBar, { DEFAULT_FILTER } from '@/components/patterns/FilterBar'
import type { PatternFilter } from '@/components/patterns/FilterBar'
import PatternCard from '@/components/patterns/PatternCard'
import PatternDetailDialog from '@/components/patterns/PatternDetailDialog'
import CommunityGallery from '@/components/community/CommunityGallery'

const PAGE_SIZE = 12
const H1_WORDS = ['100+', '图案，', '总有', '一款', '想拼']
const STATS = '100+ PATTERNS · 6 CATEGORIES · ALL FREE'

/** H1 词级上浮 */
function AnimatedTitle() {
  return (
    <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.02em] sm:text-5xl md:text-6xl">
      {H1_WORDS.map((w, i) => (
        <motion.span
          key={w}
          className="inline-block"
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 * i, type: 'spring', stiffness: 260, damping: 20 }}
        >
          {w}
          {i === 0 && <span className="inline-block w-3" />}
        </motion.span>
      ))}
    </h1>
  )
}

/** 统计行字符 scatter-in */
function ScatterStats() {
  const seeds = useMemo(
    () => STATS.split('').map(() => ({ x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 30 })),
    [],
  )
  return (
    <p className="mt-6 font-mono text-sm font-medium tracking-[0.2em] text-ash sm:text-base">
      {STATS.split('').map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, x: seeds[i].x, y: seeds[i].y }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.4 + 0.018 * i, duration: 0.4, ease: 'easeOut' }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </p>
  )
}

export default function Patterns() {
  const [tab, setTab] = useState<'library' | 'community'>(() =>
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('tab') === 'community'
      ? 'community'
      : 'library',
  )
  const [filter, setFilter] = useState<PatternFilter>(DEFAULT_FILTER)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [preview, setPreview] = useState<BeadPattern | null>(null)
  const [stuck, setStuck] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  /* 工具栏吸顶检测 */
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), {
      rootMargin: '-73px 0px 0px 0px',
    })
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  /* 筛选变化回到首批 */
  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [filter])

  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase()
    const list = PATTERNS.filter((p) => {
      if (filter.category !== 'all' && p.category !== filter.category) return false
      if (filter.maxDifficulty > 0 && p.difficulty > filter.maxDifficulty) return false
      if (filter.size !== 'all' && sizeBucket(p) !== filter.size) return false
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })
    switch (filter.sort) {
      case 'newest':
        return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      case 'fewest':
        return [...list].sort((a, b) => a.beads - b.beads)
      default:
        return [...list].sort((a, b) => b.popularity - a.popularity)
    }
  }, [filter])

  const shown = filtered.slice(0, visible)

  return (
    <div className="bg-cream">
      {/* Section 1 · 页头 */}
      <section className="mx-auto max-w-site px-4 pb-10 pt-14 sm:px-6 md:pt-20">
        <SectionTag bead="bg-sky" en="PATTERN LIBRARY" zh="图案库" />
        <AnimatedTitle />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-4 max-w-xl text-base leading-relaxed text-ink/70"
        >
          从 21 格小图到 57 格大作，每张图都附真实豆色清单。
        </motion.p>
        <ScatterStats />

        {/* 图案库 / 社区作品 切换 */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              { id: 'library', label: '图案库', icon: <LayoutGrid size={14} /> },
              { id: 'community', label: '社区作品', icon: <Users size={14} /> },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-5 py-2.5 text-sm font-bold transition-all',
                tab === t.id
                  ? 'shadow-bead active:shadow-bead-pressed border-cherry bg-cherry text-white'
                  : 'border-ink/20 bg-bead-white text-ink hover:border-cherry hover:text-cherry',
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Section 2 · 吸顶筛选工具栏（仅图案库） */}
      {tab === 'library' && (
        <>
          <div ref={sentinelRef} className="h-px" aria-hidden="true" />
          <div className="sticky top-[84px] z-40 px-4 sm:px-6">
            <div
              className={`mx-auto max-w-site transition-shadow duration-300 ${
                stuck ? '[&>div]:shadow-card-hover' : ''
              }`}
            >
              <FilterBar filter={filter} onChange={setFilter} />
            </div>
          </div>
        </>
      )}

      {/* Section 3 · 图案网格 / 社区作品 */}
      <section className="mx-auto max-w-site px-4 pb-24 pt-8 sm:px-6">
        {tab === 'community' ? (
          <CommunityGallery />
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="font-pixel text-xs text-ash pixel-shadow">NO BEADS FOUND</p>
            <p className="text-ink/70">没有找到匹配的图案，试试放宽筛选条件。</p>
            <BeadButton variant="ghost" size="sm" onClick={() => setFilter(DEFAULT_FILTER)}>
              清除全部筛选
            </BeadButton>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {shown.map((p) => (
                <PatternCard key={p.id} pattern={p} onPreview={setPreview} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {tab === 'library' && visible < filtered.length && (
          <div className="mt-12 flex justify-center">
            <BeadButton variant="yolk" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              加载更多（还有 {filtered.length - visible} 张）
            </BeadButton>
          </div>
        )}
      </section>

      {/* Section 4 · 详情弹层 */}
      <PatternDetailDialog pattern={preview} onClose={() => setPreview(null)} />

      {/* Section 5 · 投稿横幅 */}
      <section className="mx-auto max-w-site px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-pegboard flex flex-col items-start gap-6 rounded-card border border-matcha/30 bg-matcha/10 p-8 sm:flex-row sm:items-center sm:justify-between md:p-10"
        >
          <div className="flex items-center gap-5">
            <motion.span
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-matcha text-white shadow-bead"
            >
              <Brush size={26} />
            </motion.span>
            <div>
              <h3 className="text-2xl font-black tracking-[-0.02em]">没有想要的？画一个，分享给大家</h3>
              <p className="mt-1.5 text-sm text-ink/65">在创作工坊完成作品后可投稿到图案库，让更多人拼到你的灵感。</p>
            </div>
          </div>
          <BeadButton to="/studio" variant="ghost" className="shrink-0">
            去创作 →
          </BeadButton>
        </motion.div>
      </section>
    </div>
  )
}
