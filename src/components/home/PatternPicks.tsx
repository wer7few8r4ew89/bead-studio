import { motion } from 'framer-motion'
import SectionTag from '@/components/SectionTag'
import BeadButton from '@/components/BeadButton'

const PICKS = [
  { img: '/pattern-shiba.png', name: '柴犬君', size: '29×29', beads: 412, level: 3 },
  { img: '/pattern-heart.png', name: '经典爱心', size: '29×29', beads: 268, level: 1 },
  { img: '/pattern-spaceship.png', name: '复古飞船', size: '25×25', beads: 305, level: 3 },
  { img: '/pattern-cherry.png', name: '小樱桃', size: '21×21', beads: 158, level: 2 },
]

/** 难度豆标：1-5 颗红色小豆 */
function DifficultyBeads({ level }: { level: number }) {
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

export default function PatternPicks() {
  return (
    <section className="bg-sand py-16 md:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTag bead="bg-yolk" en="PATTERN PICKS" zh="精选图案" />
          <h2 className="mt-4 text-3xl font-black tracking-[-0.02em] md:text-5xl">
            不知道拼什么？从这里挑
          </h2>
        </motion.div>

        <motion.div
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ staggerChildren: 0.12 }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          {PICKS.map((p) => (
            <motion.article
              key={p.name}
              variants={{
                hidden: { scale: 0.9, opacity: 0 },
                show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
              }}
              className="group relative w-[260px] shrink-0 snap-start overflow-hidden rounded-card bg-bead-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:outline hover:outline-2 hover:outline-yolk lg:w-auto"
            >
              <div className="relative overflow-hidden">
                {/* pixelate → sharp：低分辨率感滤镜过渡到清晰 */}
                <img
                  src={p.img}
                  alt={`拼豆图案：${p.name}`}
                  className="aspect-square w-full object-cover transition-all [transition-duration:400ms] [filter:blur(3px)_contrast(1.15)_saturate(1.1)] group-hover:[filter:none]"
                />
                {/* hover 覆盖按钮 */}
                <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/25 group-hover:opacity-100">
                  <BeadButton to="/studio" size="sm">
                    用这张图创作 →
                  </BeadButton>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <DifficultyBeads level={p.level} />
                </div>
                <p className="mt-1 font-mono text-xs text-ash">
                  {p.size} · {p.beads} 豆
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <BeadButton to="/patterns" variant="ghost">
            查看全部 100+ 图案
          </BeadButton>
        </motion.div>
      </div>
    </section>
  )
}
