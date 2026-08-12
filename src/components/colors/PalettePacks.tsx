import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import type { PalettePack } from '@/data/beads'
import { PALETTE_PACKS, getBead } from '@/data/beads'
import SectionTag from '@/components/SectionTag'
import BeadBall from '@/components/colors/BeadBall'

const H2_WORDS = ['四套', '不会', '翻车的', '配色']

function PackCard({ pack }: { pack: PalettePack }) {
  return (
    <motion.div
      variants={{
        hidden: { y: 32, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
      }}
      whileHover="hover"
      className="bg-pegboard-light flex flex-col rounded-card border border-white/10 bg-white/[0.06] p-5 transition-colors hover:border-yolk/50"
    >
      {/* 5 颗豆球渐变展示 */}
      <div className="flex items-center justify-between">
        {pack.ids.map((id, i) => (
          <motion.span
            key={id}
            variants={{ hover: { y: [0, -10, 0] } }}
            transition={{ duration: 0.45, delay: 0.06 * i }}
          >
            <BeadBall hex={getBead(id).hex} size={38} title={`${id} ${getBead(id).name}`} />
          </motion.span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <img
          src={pack.patternImg}
          alt={`${pack.name} 代表图案`}
          loading="lazy"
          className="h-12 w-12 shrink-0 rounded-full border-2 border-white/15 object-cover"
        />
        <div>
          <h3 className="text-xl font-black text-sand">「{pack.name}」</h3>
          <p className="text-xs text-sand/60">{pack.scene}</p>
        </div>
      </div>

      <p className="mt-3 font-mono text-[11px] tracking-wide text-sand/40">
        {pack.ids.join(' · ')}
      </p>

      <Link
        to={`/studio?palette=${pack.id}`}
        className="mt-4 inline-flex items-center gap-1.5 border-t border-dashed border-white/15 pt-3.5 text-sm font-bold text-yolk transition-colors hover:text-[#FFD25E]"
      >
        整套带走 <ArrowRight size={15} />
      </Link>
    </motion.div>
  )
}

/** 配色方案推荐「懒人配色包」（深色段落） */
export default function PalettePacks() {
  return (
    <section className="relative bg-charcoal">
      <div className="pixel-stairs-dark -translate-y-px" aria-hidden="true" />
      <div className="mx-auto max-w-site px-4 py-16 sm:px-6 md:py-24">
        <SectionTag bead="bg-yolk" en="PALETTE PACKS" zh="懒人配色包" dark />
        <h2 className="mt-5 text-3xl font-black tracking-[-0.02em] text-sand sm:text-4xl md:text-5xl">
          {H2_WORDS.map((w, i) => (
            <motion.span
              key={w}
              className="inline-block"
              initial={{ y: 28, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ delay: 0.08 * i, type: 'spring', stiffness: 260, damping: 20 }}
            >
              {w}
            </motion.span>
          ))}
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-3 max-w-lg text-sm leading-relaxed text-sand/60"
        >
          照抄不翻车：每套五色都经过真实作品验证，点击整套带进创作工坊。
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {PALETTE_PACKS.map((p) => (
            <PackCard key={p.id} pack={p} />
          ))}
        </motion.div>
      </div>
      <div className="pixel-stairs-dark-flip translate-y-px" aria-hidden="true" />
    </section>
  )
}
