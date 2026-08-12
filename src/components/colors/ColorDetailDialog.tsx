import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router'
import { Check, Copy, X } from 'lucide-react'
import type { BeadColor } from '@/data/beads'
import { combosFor, getBead, hexToRgb } from '@/data/beads'
import { patternsUsingBead } from '@/data/patterns'
import BeadButton from '@/components/BeadButton'
import BeadBall from '@/components/colors/BeadBall'
import PixelArt from '@/components/patterns/PixelArt'

/** 可复制数值行 */
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
        } catch {
          /* 剪贴板不可用时静默 */
        }
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1200)
      }}
      className="group flex w-full items-center justify-between rounded-tag border border-ash/25 bg-bead-white px-3.5 py-2.5 text-left transition-colors hover:border-cherry"
    >
      <span className="text-xs font-bold text-ash">{label}</span>
      <span className="flex items-center gap-1.5 font-mono text-sm font-medium text-ink">
        {value}
        {copied ? <Check size={13} className="text-matcha" /> : <Copy size={13} className="text-ash transition-colors group-hover:text-cherry" />}
      </span>
    </button>
  )
}

interface ColorDetailDialogProps {
  bead: BeadColor | null
  onClose: () => void
}

/** 颜色详情弹层：顶部色带 + 豆球 + 数值表 + 相关图案 + 黄金搭档 */
export default function ColorDetailDialog({ bead, onClose }: ColorDetailDialogProps) {
  useEffect(() => {
    if (!bead) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [bead, onClose])

  const rgb = bead ? hexToRgb(bead.hex) : null
  const usedIn = bead ? patternsUsingBead(bead.id).slice(0, 4) : []
  const combos = bead ? combosFor(bead.id) : []
  /* 白色色带上文字用深色，其余可用白字 */
  const onBandDark = bead ? ['#FFFFFF', '#FFF3B0', '#D8D2C8', '#C7E39B', '#FBD9C0', '#7FC4E8', '#F5A8C0', '#FF9D7E'].includes(bead.hex) : false

  return (
    <AnimatePresence>
      {bead && rgb && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label={`颜色详情：${bead.name}`}
            className="flex max-h-[92dvh] w-full max-w-[720px] flex-col overflow-hidden rounded-t-card bg-cream shadow-hero-card sm:rounded-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部色带 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative flex h-[120px] shrink-0 origin-center items-center justify-center"
              style={{ backgroundColor: bead.hex }}
            >
              <span
                className="font-pixel text-[10px] uppercase tracking-wider"
                style={{ color: onBandDark ? 'rgba(43,38,34,.45)' : 'rgba(255,255,255,.75)' }}
              >
                {bead.id} · {bead.hex}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink/15 text-white transition-colors hover:bg-ink/30"
              >
                <X size={18} />
              </button>
              {/* 落位豆球 */}
              <motion.div
                initial={{ y: -32, scale: 0.6, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 320, damping: 16 }}
                className="absolute -bottom-12"
              >
                <BeadBall hex={bead.hex} size={96} className="ring-4 ring-cream" />
              </motion.div>
            </motion.div>

            {/* 内容区 */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-16 md:px-8">
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
              >
                <motion.div variants={{ hidden: { y: 12, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="text-center">
                  <h2 className="text-3xl font-black tracking-[-0.02em]">
                    {bead.name}
                    <span className="ml-3 font-mono text-base font-medium text-ash">{bead.id}</span>
                  </h2>
                  <p className="mt-1 text-sm text-ash">用量热度 {'★'.repeat(bead.heat)}{'☆'.repeat(5 - bead.heat)}</p>
                </motion.div>

                {/* HEX / RGB 值表 */}
                <motion.div variants={{ hidden: { y: 12, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <CopyRow label="HEX" value={bead.hex} />
                  <CopyRow label="RGB" value={`${rgb.r}, ${rgb.g}, ${rgb.b}`} />
                </motion.div>

                {/* 在图案库中的身影 */}
                {usedIn.length > 0 && (
                  <motion.div variants={{ hidden: { y: 12, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="mt-7">
                    <h3 className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-ash">
                      在图案库中的身影
                    </h3>
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      {usedIn.map((p) => (
                        <Link
                          key={p.id}
                          to="/patterns"
                          title={p.name}
                          className="group bg-pegboard overflow-hidden rounded-tag bg-bead-white p-2 shadow-card transition-transform hover:-translate-y-1"
                        >
                          {p.image ? (
                            <img src={p.image} alt={p.name} loading="lazy" className="aspect-square w-full rounded-[4px] object-cover" />
                          ) : (
                            <PixelArt grid={p.grid!} palette={p.palette!} glossy={false} className="aspect-square w-full" />
                          )}
                          <p className="mt-1.5 truncate text-center text-[11px] font-bold text-ink/70 group-hover:text-cherry">
                            {p.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 黄金搭档 */}
                {combos.length > 0 && (
                  <motion.div variants={{ hidden: { y: 12, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="mt-7">
                    <h3 className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-ash">
                      黄金搭档
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {combos.map((c) => (
                        <li
                          key={c.name}
                          className="flex items-center gap-3 rounded-tag border border-ash/20 bg-bead-white px-3.5 py-2.5"
                        >
                          <span className="flex -space-x-2">
                            {c.ids.map((id) => (
                              <BeadBall
                                key={id}
                                hex={getBead(id).hex}
                                size={26}
                                hole={false}
                                title={`${id} ${getBead(id).name}`}
                                className="ring-2 ring-bead-white"
                              />
                            ))}
                          </span>
                          <span className="text-sm font-bold">{c.name}</span>
                          <span className="ml-auto font-mono text-[11px] text-ash">{c.ids.join(' + ')}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <motion.div variants={{ hidden: { y: 12, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="mt-7 flex justify-center">
                  <BeadButton to={`/studio?color=${bead.id}`} size="lg">
                    用这个颜色创作 →
                  </BeadButton>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
