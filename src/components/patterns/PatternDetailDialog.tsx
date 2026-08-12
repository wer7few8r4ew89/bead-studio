import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Heart, X } from 'lucide-react'
import type { BeadPattern } from '@/data/patterns'
import { CATEGORIES } from '@/data/patterns'
import { getBead } from '@/data/beads'
import { cn } from '@/lib/utils'
import BeadButton from '@/components/BeadButton'
import PixelArt from '@/components/patterns/PixelArt'
import { DifficultyBeads } from '@/components/patterns/PatternCard'

interface PatternDetailDialogProps {
  pattern: BeadPattern | null
  onClose: () => void
}

/** 收藏爱心：点击回弹 + 4 颗迷你豆粒子溅出 */
function FavoriteButton() {
  const [fav, setFav] = useState(false)
  const [burst, setBurst] = useState(0)
  return (
    <button
      type="button"
      aria-label="收藏"
      onClick={() => {
        setFav((v) => !v)
        setBurst((b) => b + 1)
      }}
      className={cn(
        'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        fav ? 'border-cherry bg-cherry/10 text-cherry' : 'border-ink/30 text-ink/60 hover:border-cherry hover:text-cherry',
      )}
    >
      <motion.span
        key={`${fav}-${burst}`}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
        className="flex"
      >
        <Heart size={20} fill={fav ? '#E8452C' : 'none'} />
      </motion.span>
      {/* 迷你豆粒子 */}
      {burst > 0 && (
        <span key={burst} className="pointer-events-none absolute inset-0">
          {['#E8452C', '#FFC93C', '#3E8EDE', '#58A05C'].map((c, i) => (
            <motion.span
              key={c}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((i / 4) * Math.PI * 2) * 26,
                y: Math.sin((i / 4) * Math.PI * 2) * 26 - 6,
                opacity: 0,
                scale: 0.4,
              }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: c }}
            />
          ))}
        </span>
      )}
    </button>
  )
}

/** 图案详情弹层：左图右档，用色清单 + 一键载入编辑器 */
export default function PatternDetailDialog({ pattern, onClose }: PatternDetailDialogProps) {
  const [tipOpen, setTipOpen] = useState(false)

  /* Esc 关闭 + 锁定背景滚动 */
  useEffect(() => {
    if (!pattern) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [pattern, onClose])

  useEffect(() => {
    setTipOpen(false)
  }, [pattern?.id])

  const total = pattern?.colors.reduce((s, c) => s + c.count, 0) ?? 0

  return (
    <AnimatePresence>
      {pattern && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label={`图案详情：${pattern.name}`}
            className="flex max-h-[92dvh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-card bg-bead-white shadow-hero-card sm:rounded-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭 */}
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-ink/70 transition-colors hover:bg-yolk hover:text-ink"
            >
              <X size={18} />
            </button>

            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              {/* 左栏：大图预览 */}
              <div className="bg-pegboard relative flex items-center justify-center bg-cream p-6 md:w-[45%] md:p-8">
                <span className="absolute left-4 top-4 rounded-tag bg-ink px-2.5 py-1 font-mono text-xs font-medium text-sand">
                  {pattern.width}×{pattern.height}
                </span>
                {pattern.image ? (
                  <motion.img
                    src={pattern.image}
                    alt={`拼豆图案：${pattern.name}`}
                    initial={{ filter: 'blur(6px) contrast(1.15)', scale: 1.02 }}
                    animate={{ filter: 'blur(0px) contrast(1)', scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="aspect-square w-full max-w-[340px] rounded-card object-cover shadow-card"
                  />
                ) : (
                  <motion.div
                    initial={{ filter: 'blur(4px)', scale: 1.02 }}
                    animate={{ filter: 'blur(0px)', scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-[340px] rounded-card bg-bead-white p-4 shadow-card"
                  >
                    <PixelArt
                      grid={pattern.grid!}
                      palette={pattern.palette!}
                      className="aspect-square w-full"
                    />
                  </motion.div>
                )}
              </div>

              {/* 右栏：档案 + 用色清单 */}
              <div className="flex min-h-0 flex-1 flex-col md:w-[55%]">
                <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-7">
                  <h2 className="text-2xl font-black tracking-[-0.02em] md:text-3xl">{pattern.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ash">
                    <span className="rounded-tag border border-matcha/60 px-2 py-0.5 text-[11px] font-bold text-matcha">
                      {CATEGORIES.find((c) => c.id === pattern.category)?.label}
                    </span>
                    <DifficultyBeads level={pattern.difficulty} />
                    <span className="font-mono text-xs">by {pattern.author}</span>
                  </div>

                  {/* 用色清单 */}
                  <h3 className="mt-6 font-mono text-xs font-medium uppercase tracking-[0.18em] text-ash">
                    用色清单
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {pattern.colors.map((c, i) => {
                      const bead = getBead(c.beadId)
                      const pct = Math.round((c.count / total) * 100)
                      return (
                        <motion.li
                          key={c.beadId}
                          initial={{ x: -16, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.06 * i, duration: 0.3 }}
                          className="flex items-center gap-3"
                        >
                          <span
                            className="bead-ball h-7 w-7 shrink-0"
                            style={{ backgroundColor: bead.hex }}
                          />
                          <span className="w-28 shrink-0 text-sm font-bold">
                            <span className="mr-1.5 font-mono text-xs font-medium text-ash">{bead.id}</span>
                            {bead.name}
                          </span>
                          <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-sand">
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3 + 0.06 * i, duration: 0.5, ease: 'easeOut' }}
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{ backgroundColor: bead.hex }}
                            />
                          </span>
                          <span className="w-16 shrink-0 text-right font-mono text-xs text-ash">
                            {c.count} · {pct}%
                          </span>
                        </motion.li>
                      )
                    })}
                  </ul>

                  {/* 总豆数 */}
                  <div className="mt-6 flex items-end gap-2">
                    <span className="font-mono text-5xl font-medium leading-none text-cherry">{total}</span>
                    <span className="pb-1 text-sm font-bold text-ash">颗豆子</span>
                  </div>

                  {/* 拼豆小贴士 */}
                  <div className="mt-5 rounded-tag border border-dashed border-ash/40 bg-cream/70">
                    <button
                      type="button"
                      onClick={() => setTipOpen((v) => !v)}
                      className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-ink"
                    >
                      拼豆小贴士
                      <ChevronDown
                        size={16}
                        className={cn('transition-transform duration-300', tipOpen && 'rotate-180')}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {tipOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-sm leading-relaxed text-ink/75">{pattern.tip}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 底部固定操作条 */}
                <div className="flex items-center gap-3 border-t border-dashed border-ash/30 bg-bead-white p-4 md:px-7">
                  <BeadButton to={`/studio?pattern=${pattern.id}`} size="lg" className="flex-1">
                    立即开拼 →
                  </BeadButton>
                  <FavoriteButton />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
