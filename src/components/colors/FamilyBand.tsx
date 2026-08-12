import { motion } from 'framer-motion'
import type { BeadColor, Family } from '@/data/beads'
import { beadsByFamily } from '@/data/beads'
import { cn } from '@/lib/utils'
import BeadCard from '@/components/colors/BeadCard'

interface FamilyBandProps {
  family: Family
  /** 交替背景 */
  alt: boolean
  onOpen: (b: BeadColor) => void
}

/** 色系家族色带：左侧家族名区 + 右侧 4 张档案卡 */
export default function FamilyBand({ family, alt, onOpen }: FamilyBandProps) {
  const beads = beadsByFamily(family.id)
  return (
    <section className={cn('py-12 md:py-16', alt ? 'bg-sand' : 'bg-cream')}>
      <div className="mx-auto grid max-w-site gap-8 px-4 sm:px-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* 家族名区 */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex flex-row items-center gap-4 lg:flex-col lg:items-start lg:justify-center lg:gap-0"
        >
          <span
            className="bead-ball h-12 w-12 shrink-0 lg:mb-5"
            style={{ backgroundColor: family.accent }}
          />
          <div>
            <h2 className="text-3xl font-black tracking-[-0.02em]">{family.zh}</h2>
            <p className="mt-1 font-pixel text-[9px] uppercase text-ash pixel-shadow">{family.en}</p>
            <p className="mt-3 max-w-[200px] text-sm leading-relaxed text-ink/65">{family.desc}</p>
          </div>
        </motion.div>

        {/* 档案卡 2×2 / 4 横排 */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4"
        >
          {beads.map((b) => (
            <BeadCard key={b.id} bead={b} onOpen={onOpen} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
