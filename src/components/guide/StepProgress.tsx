import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const GUIDE_STEPS = [
  { n: 1, label: '选豆备料', color: '#E8452C' },
  { n: 2, label: '画图纸', color: '#FFC93C' },
  { n: 3, label: '摆豆熨烫', color: '#3E8EDE' },
  { n: 4, label: '冷却定型', color: '#58A05C' },
] as const

interface StepProgressProps {
  /** 当前点亮步骤（1-4，0 表示都在页头） */
  active: number
  onSelect?: (n: number) => void
}

/** 四步进度预览条：4 颗大豆球由虚线连接，随滚动点亮 */
export default function StepProgress({ active, onSelect }: StepProgressProps) {
  return (
    <div className="pointer-events-auto mx-auto flex w-fit max-w-full items-center rounded-full border border-ink/10 bg-cream/85 px-4 py-2.5 shadow-card backdrop-blur-md sm:px-6 sm:py-3">
      {GUIDE_STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          {i > 0 && (
            <div className="w-5 overflow-hidden sm:w-10">
              <motion.div
                className="border-t-2 border-dashed border-ash/40"
                style={{ transformOrigin: 'left center' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.6 + i * 0.1, ease: 'easeOut' }}
              />
            </div>
          )}
          <motion.button
            type="button"
            onClick={() => onSelect?.(s.n)}
            title={`第 ${s.n} 步 · ${s.label}`}
            aria-label={`跳到第 ${s.n} 步：${s.label}`}
            className="flex cursor-pointer flex-col items-center gap-1 outline-none"
            initial={{ y: -24, scale: 0.6, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ delay: 0.12 * i, type: 'spring', stiffness: 320, damping: 18 }}
          >
            <span
              className={cn(
                'bead-ball flex h-10 w-10 items-center justify-center transition-all duration-300 sm:h-12 sm:w-12',
                active === s.n && 'scale-110 ring-2 ring-yolk ring-offset-2 ring-offset-cream',
              )}
              style={{ backgroundColor: active === s.n ? s.color : '#D8D2C8' }}
            >
              <span
                className={cn(
                  'font-mono text-sm font-medium sm:text-base',
                  active === s.n ? (s.color === '#FFC93C' ? 'text-ink' : 'text-white') : 'text-ash',
                )}
              >
                {s.n}
              </span>
            </span>
            <span
              className={cn(
                'hidden text-[11px] font-bold transition-colors sm:block',
                active === s.n ? 'text-ink' : 'text-ash/70',
              )}
            >
              {s.label}
            </span>
          </motion.button>
        </div>
      ))}
    </div>
  )
}
