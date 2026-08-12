import { motion } from 'framer-motion'
import { Link } from 'react-router'
import type { BeadPattern } from '@/data/patterns'
import { CATEGORIES } from '@/data/patterns'
import PixelArt from '@/components/patterns/PixelArt'

/** 难度豆标：1-5 颗小豆（cherry 实色 / ash 空豆） */
export function DifficultyBeads({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-1" title={`难度 ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 10 10" className="h-2.5 w-2.5">
          <circle cx="5" cy="5" r="4.4" fill={i < level ? '#E8452C' : '#E5DDCE'} />
          {i < level && <ellipse cx="3.6" cy="3.4" rx="1.4" ry="0.9" fill="#fff" opacity="0.7" />}
        </svg>
      ))}
    </span>
  )
}

interface PatternCardProps {
  pattern: BeadPattern
  onPreview: (p: BeadPattern) => void
}

/** 图案卡片：缩略图 + 名称 + 数据行 + 难度豆标，hover 滑出操作按钮 */
export default function PatternCard({ pattern, onPreview }: PatternCardProps) {
  const categoryLabel = CATEGORIES.find((c) => c.id === pattern.category)?.label ?? ''
  return (
    <motion.article
      layout="position"
      initial={{ y: -24, scale: 0.6, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-card bg-bead-white shadow-card transition-shadow duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:outline hover:outline-2 hover:outline-yolk"
    >
      {/* 缩略图区 */}
      <button
        type="button"
        onClick={() => onPreview(pattern)}
        className="bg-pegboard relative block w-full cursor-pointer bg-bead-white p-5"
        aria-label={`预览图案 ${pattern.name}`}
      >
        {/* pixelate → sharp */}
        {pattern.image ? (
          <img
            src={pattern.image}
            alt={`拼豆图案：${pattern.name}`}
            loading="lazy"
            className="aspect-square w-full rounded-tag object-cover transition-all [transition-duration:400ms] [filter:blur(3px)_contrast(1.15)_saturate(1.1)] group-hover:[filter:none]"
          />
        ) : (
          <PixelArt
            grid={pattern.grid!}
            palette={pattern.palette!}
            glossy={false}
            className="aspect-square w-full transition-all [transition-duration:400ms] [filter:blur(1.5px)_contrast(1.1)] group-hover:[filter:none]"
          />
        )}
        {/* hover 操作条 */}
        <span className="pointer-events-none absolute inset-x-5 bottom-5 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="pointer-events-auto inline-flex h-9 flex-1 items-center justify-center rounded-full border-2 border-ink/70 bg-bead-white/90 text-sm font-bold text-ink transition-colors hover:border-cherry hover:text-cherry">
            预览详情
          </span>
          <Link
            to={`/studio?pattern=${pattern.id}`}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto inline-flex h-9 flex-1 items-center justify-center rounded-full bg-cherry text-sm font-bold text-white shadow-bead transition-all hover:bg-[#F05036]"
          >
            立即开拼 →
          </Link>
        </span>
      </button>

      {/* 信息区 */}
      <div className="flex flex-1 flex-col gap-1.5 p-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-lg font-bold leading-snug">{pattern.name}</h3>
          <span className="shrink-0 rounded-tag border border-matcha/60 px-2 py-0.5 text-[11px] font-bold text-matcha">
            {categoryLabel}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-ash">
            {pattern.width}×{pattern.height} · {pattern.beads} 豆 · {pattern.colors.length} 色
          </p>
          <DifficultyBeads level={pattern.difficulty} />
        </div>
      </div>
    </motion.article>
  )
}
