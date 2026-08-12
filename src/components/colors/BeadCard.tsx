import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import type { BeadColor } from '@/data/beads'
import { getBead } from '@/data/beads'
import BeadBall from '@/components/colors/BeadBall'

/** 用量热度条：5 格像素条，逐格点亮 */
function HeatBar({ heat, hex }: { heat: number; hex: string }) {
  return (
    <span className="flex items-center gap-1" title={`用量热度 ${heat}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + 0.1 * i, duration: 0.2 }}
          className="h-3 w-1.5 origin-bottom rounded-[2px]"
          style={{ backgroundColor: i < heat ? hex : '#E5DDCE' }}
        />
      ))}
    </span>
  )
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

interface BeadCardProps {
  bead: BeadColor
  onOpen: (b: BeadColor) => void
}

/** 豆子档案卡：拟物豆球 + 豆号色名 + HEX 复制 + 热度条 + 常用搭配 */
export default function BeadCard({ bead, onOpen }: BeadCardProps) {
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 260, damping: 20 })
  const sry = useSpring(ry, { stiffness: 260, damping: 20 })

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ry.set(px * 16)
    rx.set(-py * 16)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (await copyText(bead.hex)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    }
  }

  return (
    <motion.div
      variants={{
        hidden: { y: -24, scale: 0.6, opacity: 0 },
        show: { y: 0, scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 20 } },
      }}
      className="h-full"
      style={{ perspective: 600 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={() => onOpen(bead)}
        style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        className="flex h-full cursor-pointer flex-col items-center gap-2 rounded-2xl bg-bead-white p-4 pt-5 text-center shadow-card transition-shadow duration-300 hover:-translate-y-1 hover:shadow-card-hover"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(bead)}
        aria-label={`查看 ${bead.name} 详情`}
      >
        {/* 拟物大豆球 */}
        <BeadBall hex={bead.hex} size={72} />

        {/* 豆号 + 色名 */}
        <div className="mt-1">
          <p className="font-mono text-[11px] font-medium tracking-wider text-ash">{bead.id}</p>
          <h4 className="text-lg font-bold leading-tight">{bead.name}</h4>
        </div>

        {/* HEX 复制 */}
        <button
          type="button"
          onClick={onCopy}
          className="relative inline-flex items-center gap-1 rounded-tag bg-sand/70 px-2 py-1 font-mono text-[11px] text-ash transition-colors hover:bg-yolk/60 hover:text-ink"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {bead.hex}
          {copied && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-tag bg-ink px-2 py-0.5 text-[10px] text-sand">
              已复制
            </span>
          )}
        </button>

        {/* 用量热度 */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ash">用量热度</span>
          <HeatBar heat={bead.heat} hex={bead.hex} />
        </div>

        {/* 常用搭配 */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-[11px] text-ash">常用搭配</span>
          <span className="flex -space-x-1.5">
            {bead.pairings.map((id) => {
              const p = getBead(id)
              return (
                <BeadBall
                  key={id}
                  hex={p.hex}
                  size={20}
                  hole={false}
                  title={`${p.id} ${p.name}`}
                  className="ring-2 ring-bead-white"
                />
              )
            })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
