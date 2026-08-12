import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { motion } from 'framer-motion'
import BeadButton from '@/components/BeadButton'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Bead {
  code: string
  name: string
  color: string
}
interface Family {
  name: string
  en: string
  beads: Bead[]
}

const FAMILIES: Family[] = [
  {
    name: '红色系', en: 'RED',
    beads: [
      { code: 'R-01', name: '樱桃红', color: '#E8452C' },
      { code: 'R-02', name: '蜜桃粉', color: '#F2718C' },
      { code: 'R-03', name: '砖红', color: '#B02E1F' },
      { code: 'R-04', name: '三文鱼', color: '#FF9D7E' },
    ],
  },
  {
    name: '橙黄系', en: 'AMBER',
    beads: [
      { code: 'Y-01', name: '蜜橙', color: '#F08A1D' },
      { code: 'Y-02', name: '明黄', color: '#FFC93C' },
      { code: 'Y-03', name: '奶油黄', color: '#FFF3B0' },
      { code: 'Y-04', name: '焦糖', color: '#C97B12' },
    ],
  },
  {
    name: '绿色系', en: 'GREEN',
    beads: [
      { code: 'G-01', name: '抹茶', color: '#58A05C' },
      { code: 'G-02', name: '青柠', color: '#9BCB3C' },
      { code: 'G-03', name: '深林', color: '#2E7D4F' },
      { code: 'G-04', name: '嫩芽', color: '#C7E39B' },
    ],
  },
  {
    name: '蓝紫系', en: 'BLUE',
    beads: [
      { code: 'B-01', name: '天空蓝', color: '#3E8EDE' },
      { code: 'B-02', name: '浅蓝', color: '#7FC4E8' },
      { code: 'B-03', name: '葡萄紫', color: '#8B5FBF' },
      { code: 'B-04', name: '藏青', color: '#2C4E8A' },
    ],
  },
  {
    name: '粉棕系', en: 'EARTH',
    beads: [
      { code: 'P-01', name: '樱花粉', color: '#F5A8C0' },
      { code: 'P-02', name: '可可', color: '#A9714B' },
      { code: 'P-03', name: '深棕', color: '#6B4530' },
      { code: 'P-04', name: '奶杏', color: '#FBD9C0' },
    ],
  },
  {
    name: '无彩色', en: 'NEUTRAL',
    beads: [
      { code: 'N-01', name: '豆白', color: '#FFFFFF' },
      { code: 'N-02', name: '米灰', color: '#D8D2C8' },
      { code: 'N-03', name: '软灰', color: '#8A8177' },
      { code: 'N-04', name: '墨黑', color: '#2B2622' },
    ],
  },
]

function BeadBall({ bead, index }: { bead: Bead; index: number }) {
  return (
    <motion.div
      className="group relative"
      initial={{ y: -24, scale: 0.6, opacity: 0 }}
      whileInView={{ y: 0, scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: 0.15 + index * 0.08, type: 'spring', stiffness: 320, damping: 17 }}
    >
      <div
        className="bead-ball h-16 w-16 cursor-pointer transition-transform duration-200 ease-bounce group-hover:scale-[1.15]"
        style={{ backgroundColor: bead.color }}
      />
      {/* 豆号 tooltip */}
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-tag bg-sand px-2 py-1 font-mono text-[10px] font-medium text-ink opacity-0 shadow-card transition-opacity duration-200 group-hover:opacity-100">
        {bead.code} {bead.name}
      </span>
    </motion.div>
  )
}

export default function ColorFamilies() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  /* Scroll pin + 横向平移：总位移 = 卡列宽 - 视口宽 */
  useGSAP(
    () => {
      const track = trackRef.current
      const section = sectionRef.current
      if (!track || !section) return
      gsap.to(track, {
        x: () => -(track.scrollWidth - section.clientWidth + 48),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-charcoal">
      <div className="pixel-stairs-dark-flip" aria-hidden="true" />
      <div className="bg-pegboard-light flex min-h-[calc(100dvh-32px)] flex-col justify-center py-14">
        <div className="mx-auto w-full max-w-site px-4 sm:px-6">
          <motion.h2
            className="text-3xl font-black tracking-[-0.02em] text-sand md:text-5xl"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
          >
            挑豆，是最治愈的一步
          </motion.h2>
          <motion.p
            className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-sand/50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            24 COLORS · 6 FAMILIES
          </motion.p>
        </div>

        {/* 横向滚动卡列 */}
        <div className="mt-10 overflow-hidden">
          <div ref={trackRef} className="flex w-max gap-6 px-4 sm:px-6">
            {FAMILIES.map((f) => (
              <div
                key={f.name}
                className="flex w-[280px] shrink-0 flex-col rounded-card bg-white/[0.06] p-6 backdrop-blur-sm"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-sand">{f.name}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sand/40">{f.en}</span>
                </div>
                <div className="mt-6 flex flex-col items-center gap-5">
                  {f.beads.map((b, i) => (
                    <BeadBall key={b.code} bead={b} index={i} />
                  ))}
                </div>
              </div>
            ))}

            {/* CTA 卡 */}
            <div className="flex w-[280px] shrink-0 flex-col items-center justify-center gap-5 rounded-card border-2 border-dashed border-yolk/40 p-6 text-center">
              <p className="text-xl font-bold text-sand">想看看全部 24 色？</p>
              <BeadButton to="/colors" variant="yolk">
                打开完整色卡 →
              </BeadButton>
            </div>
          </div>
        </div>
      </div>
      <div className="pixel-stairs-dark" aria-hidden="true" />
    </section>
  )
}
