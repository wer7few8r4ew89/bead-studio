import { motion } from 'framer-motion'
import SectionTag from '@/components/SectionTag'
import BeadButton from '@/components/BeadButton'

const WORKS = [
  { img: '/pattern-cactus.png', user: '豆豆龙', beads: 184 },
  { img: '/pattern-mushroom.png', user: '小熨斗', beads: 156 },
  { img: '/pattern-cat.png', user: '夜喵子', beads: 340 },
  { img: '/pattern-whale.png', user: '蓝色海', beads: 268 },
  { img: '/pattern-cherry.png', user: '甜甜圈', beads: 158 },
  { img: '/pattern-spaceship.png', user: '宇航员小李', beads: 305 },
  { img: '/pattern-shiba.png', user: '柴柴妈', beads: 412 },
  { img: '/pattern-heart.png', user: '心心', beads: 268 },
  { img: '/pattern-cactus.png', user: '沙漠绿洲', beads: 190 },
]

export default function CommunityCta() {
  return (
    <section className="bg-cream pb-24 pt-4 md:pt-8">
      <div className="mx-auto max-w-site px-4 sm:px-6">
        {/* 作品墙 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTag bead="bg-cherry" en="COMMUNITY" zh="社区作品墙" />
          <h2 className="mt-4 text-3xl font-black tracking-[-0.02em] md:text-5xl">大家拼了什么</h2>
        </motion.div>

        <motion.div
          className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        >
          {WORKS.map((w, i) => (
            <motion.article
              key={`${w.user}-${i}`}
              variants={{
                hidden: { y: -24, scale: 0.6, opacity: 0 },
                show: { y: 0, scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } },
              }}
              whileHover={{ rotate: i % 2 === 0 ? 3 : -3, y: -4 }}
              className="overflow-hidden rounded-card bg-bead-white shadow-card transition-shadow hover:shadow-card-hover"
            >
              <img src={w.img} alt={`${w.user} 的拼豆作品`} className="aspect-square w-full object-cover" loading="lazy" />
              <div className="flex items-center justify-between p-3.5">
                <span className="text-sm font-bold">@{w.user}</span>
                <span className="rounded-tag bg-sand px-2 py-0.5 font-mono text-[11px] text-ink/70">
                  拼了 {w.beads} 颗豆
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* 终段 CTA 横幅 */}
        <motion.div
          className="bg-pegboard-grape relative mt-20 overflow-hidden rounded-[32px] bg-grape px-6 py-16 text-center shadow-hero-card md:py-20"
          initial={{ scale: 0.94, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <h2 className="text-balance text-3xl font-black tracking-[-0.02em] text-white md:text-5xl">
            你的第一幅作品，从一颗豆开始
          </h2>
          <div className="mt-8 flex items-center justify-center gap-4">
            <BeadButton to="/studio" size="lg">
              进入创作工坊
            </BeadButton>
            {/* 常驻浮动小豆 */}
            <motion.svg
              viewBox="0 0 24 24"
              className="h-10 w-10 animate-float-bead"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="16" height="16" rx="6" fill="#FFC93C" />
              <rect x="4" y="15" width="16" height="5" rx="2.5" fill="#C97B12" opacity="0.55" />
              <circle cx="12" cy="12" r="3.4" fill="#C97B12" />
              <circle cx="12" cy="12" r="1.6" fill="#8F5A0D" />
              <ellipse cx="8.6" cy="8" rx="2.6" ry="1.6" fill="#fff" opacity="0.8" />
            </motion.svg>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
