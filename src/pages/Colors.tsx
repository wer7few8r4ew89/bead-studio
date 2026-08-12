import { memo, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { Layers, Ruler, ShoppingCart } from 'lucide-react'
import type { BeadColor } from '@/data/beads'
import { FAMILIES } from '@/data/beads'
import SectionTag from '@/components/SectionTag'
import FamilyBand from '@/components/colors/FamilyBand'
import ColorDetailDialog from '@/components/colors/ColorDetailDialog'
import PalettePacks from '@/components/colors/PalettePacks'
import BeadBall from '@/components/colors/BeadBall'

const H1_WORDS = ['24', '色，', '每一颗', '都有', '名字']
const HERO_BEADS = [
  { hex: '#E8452C', factor: 1.6, delay: 0 },
  { hex: '#FFC93C', factor: -1.1, delay: 0.4 },
  { hex: '#58A05C', factor: 0.8, delay: 0.8 },
  { hex: '#3E8EDE', factor: -1.7, delay: 1.2 },
  { hex: '#8B5FBF', factor: 1.2, delay: 1.6 },
]

/** 单颗视差豆球：外层视差 + 内层持续浮动（memo 隔离循环动画） */
const HeroBead = memo(function HeroBead({
  hex,
  factor,
  delay,
  mx,
  my,
}: {
  hex: string
  factor: number
  delay: number
  mx: MotionValue<number>
  my: MotionValue<number>
}) {
  const x = useTransform(mx, (v) => v * factor * 14)
  const y = useTransform(my, (v) => v * factor * 10)
  return (
    <motion.span style={{ x, y }} className="inline-block">
      <motion.span
        initial={{ y: -24, scale: 0.6, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 + 0.08 * delay * 2.5, type: 'spring', stiffness: 320, damping: 16 }}
        className="inline-block"
      >
        <motion.span
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 2.5, delay, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          <BeadBall hex={hex} size={40} />
        </motion.span>
      </motion.span>
    </motion.span>
  )
})

/** 页头右侧：5 颗大豆球随鼠标视差 */
function HeroBeads() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 120, damping: 18 })
  const smy = useSpring(my, { stiffness: 120, damping: 18 })
  return (
    <div
      className="mt-8 flex items-center gap-4 lg:mt-0"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - rect.left) / rect.width - 0.5)
        my.set((e.clientY - rect.top) / rect.height - 0.5)
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      {HERO_BEADS.map((b, i) => (
        <span key={b.hex} className={i % 2 === 1 ? 'mt-6' : '-mt-2'}>
          <HeroBead hex={b.hex} factor={b.factor} delay={b.delay} mx={smx} my={smy} />
        </span>
      ))}
    </div>
  )
}

const TIPS = [
  {
    icon: ShoppingCart,
    title: '先买高频色',
    body: '白、黑、红、黄、蓝、绿六色覆盖率超 80%，新手先入这六袋。',
    color: '#E8452C',
  },
  {
    icon: Layers,
    title: '深色多备一袋',
    body: '轮廓色用量常被低估，暖黑建议双倍囤。',
    color: '#8B5FBF',
  },
  {
    icon: Ruler,
    title: '认准豆径',
    body: '5mm 标准豆通用性最强，2.6mm 迷你豆需配专用板。',
    color: '#3E8EDE',
  },
]

export default function Colors() {
  const [selected, setSelected] = useState<BeadColor | null>(null)

  return (
    <div className="bg-cream">
      {/* Section 1 · 页头 */}
      <section className="mx-auto flex max-w-site flex-col px-4 pb-14 pt-14 sm:px-6 md:pt-20 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <SectionTag bead="bg-cherry" en="BEAD COLORS" zh="豆色材料库" />
          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.02em] sm:text-5xl md:text-6xl">
            {H1_WORDS.map((w, i) => (
              <motion.span
                key={w}
                className="inline-block"
                initial={{ y: 32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i, type: 'spring', stiffness: 260, damping: 20 }}
              >
                {w}
                {i === 0 && <span className="inline-block w-3" />}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-4 max-w-xl text-base leading-relaxed text-ink/70"
          >
            对照真实拼豆品牌色卡 1:1 校准。点击任意颜色查看搭配与用量参考。
          </motion.p>
        </div>
        <HeroBeads />
      </section>

      {/* Section 2 · 6 色系家族色带 */}
      <div>
        {FAMILIES.map((f, i) => (
          <FamilyBand key={f.id} family={f} alt={i % 2 === 1} onOpen={setSelected} />
        ))}
      </div>

      {/* Section 3 · 颜色详情弹层 */}
      <ColorDetailDialog bead={selected} onClose={() => setSelected(null)} />

      {/* Section 4 · 懒人配色包 */}
      <PalettePacks />

      {/* Section 5 · 实体配豆小贴士 */}
      <section className="mx-auto max-w-site px-4 py-16 sm:px-6 md:py-24">
        <SectionTag bead="bg-yolk" en="BUYING TIPS" zh="实体配豆贴士" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
          className="mt-5 text-3xl font-black tracking-[-0.02em] sm:text-4xl"
        >
          去实体店之前，先看这三条
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {TIPS.map((t) => (
            <motion.div
              key={t.title}
              variants={{
                hidden: { y: 32, opacity: 0 },
                show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
              }}
              className="rounded-card bg-bead-white p-6 shadow-card"
            >
              <motion.span
                variants={{
                  hidden: { rotate: -30, scale: 0.6, opacity: 0 },
                  show: {
                    rotate: 0,
                    scale: 1,
                    opacity: 1,
                    transition: { delay: 0.2, type: 'spring', stiffness: 300, damping: 14 },
                  },
                }}
                className="bead-ball flex h-12 w-12 items-center justify-center"
                style={{ backgroundColor: t.color }}
              >
                <t.icon size={22} className="text-white" />
              </motion.span>
              <h3 className="mt-4 text-xl font-bold">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{t.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
