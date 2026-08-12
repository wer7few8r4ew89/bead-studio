import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

const SIZE = 10

const PALETTE = [
  { name: '樱桃红', code: 'R-01', color: '#E8452C' },
  { name: '明黄', code: 'Y-02', color: '#FFC93C' },
  { name: '天空蓝', code: 'B-01', color: '#3E8EDE' },
] as const

/** 预置的小爱心图案（[row, col]，使用樱桃红） */
const HEART: ReadonlyArray<readonly [number, number]> = [
  [1, 2], [1, 3], [1, 5], [1, 6],
  [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
  [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
  [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
  [5, 3], [5, 4], [5, 5],
  [6, 4],
]

const HEART_ORDER = new Map<number, number>()
HEART.forEach(([y, x], order) => HEART_ORDER.set(y * SIZE + x, order))

/**
 * 交互式迷你摆豆演示：10×10 可点击小网格 + 3 色迷你调色盘。
 * 点调色盘选色，点格子放豆；再点一次已放豆的格子可取回。
 */
export default function MiniBeadDemo() {
  const [cells, setCells] = useState<Array<number | null>>(() => {
    const init: Array<number | null> = Array(SIZE * SIZE).fill(null)
    HEART.forEach(([y, x]) => {
      init[y * SIZE + x] = 0
    })
    return init
  })
  const [selected, setSelected] = useState(0)
  const interacted = useRef(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef, { once: true, amount: 0.3 })

  const used = cells.filter((c) => c !== null).length

  const toggleCell = (i: number) => {
    interacted.current = true
    setCells((prev) => {
      const next = [...prev]
      next[i] = next[i] === selected ? null : selected
      return next
    })
  }

  return (
    <div ref={wrapRef} className="rounded-card border border-ink/5 bg-sand/60 p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">
          Mini Board · 10×10
        </span>
        <span className="font-mono text-xs text-ash">
          已用 <span className="font-bold text-cherry">{used}</span> 颗豆
        </span>
      </div>

      {/* 迷你调色盘 */}
      <div className="mt-3 flex items-center gap-3">
        {PALETTE.map((p, i) => (
          <motion.button
            key={p.code}
            type="button"
            onClick={() => setSelected(i)}
            title={`${p.name} ${p.code}`}
            aria-label={`选择颜色：${p.name}`}
            aria-pressed={selected === i}
            className={cn(
              'bead-ball h-9 w-9 cursor-pointer transition-transform duration-200',
              selected === i && 'scale-110 ring-2 ring-yolk ring-offset-2 ring-offset-sand',
            )}
            style={{ backgroundColor: p.color }}
            initial={{ y: -16, scale: 0.6, opacity: 0 }}
            animate={inView ? { y: 0, scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.06 * i, type: 'spring', stiffness: 320, damping: 18 }}
          />
        ))}
        <span className="ml-1 font-mono text-[11px] text-ash">{PALETTE[selected].code}</span>
      </div>

      {/* 10×10 网格底板 */}
      <div className="mt-4 grid grid-cols-10 gap-[3px] rounded-xl bg-white p-3 shadow-inner">
        {cells.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggleCell(i)}
            aria-label={`第 ${Math.floor(i / SIZE) + 1} 行第 ${(i % SIZE) + 1} 列`}
            className="relative aspect-square w-full cursor-crosshair rounded-cell bg-[#F3EAD9] transition-colors hover:bg-[#EBDFC5]"
          >
            {c !== null && inView && (
              <motion.span
                key={`${i}-${c}`}
                className="bead-ball absolute inset-[10%]"
                style={{ backgroundColor: PALETTE[c].color }}
                initial={{ y: -10, scale: 0.5, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 480,
                  damping: 22,
                  delay: interacted.current ? 0 : (HEART_ORDER.get(i) ?? 0) * 0.02,
                }}
              />
            )}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ash">
        选一个颜色，点格子放豆；再点一次可以取回。这就是创作工坊的核心手感。
      </p>
    </div>
  )
}
