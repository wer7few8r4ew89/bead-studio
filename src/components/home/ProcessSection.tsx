import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Palette, Paintbrush, FileText, PackageCheck } from 'lucide-react'
import SectionTag from '@/components/SectionTag'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STEPS = [
  {
    num: '01',
    title: '选豆',
    en: 'PICK COLORS',
    icon: Palette,
    desc: '从 24 色真实豆色里挑出你的配色。每一颗都对应实体店能买到的豆号，配色不再凭感觉。',
  },
  {
    num: '02',
    title: '摆豆',
    en: 'PLACE BEADS',
    icon: Paintbrush,
    desc: '在网格画布上一颗一颗摆豆，也可以从图案库挑个模板再改成自己的样子。',
  },
  {
    num: '03',
    title: '导出图纸',
    en: 'EXPORT CHART',
    icon: FileText,
    desc: '自动统计每种颜色用几颗豆，生成高清图纸 PDF。拿着清单去配豆，一颗不浪费。',
  },
  {
    num: '04',
    title: '实体拼豆',
    en: 'MAKE IT REAL',
    icon: PackageCheck,
    desc: '照着图纸摆出真的作品，盖上烘焙纸低温熨烫定型——你的像素，落地了。',
  },
]

/* ---------- 迷你演示 ---------- */

/** 01 选豆：6 颗豆子从灰度点亮为彩色 */
function DemoPick() {
  const colors = ['#E8452C', '#FFC93C', '#58A05C', '#3E8EDE', '#8B5FBF', '#F5A8C0']
  return (
    <div className="flex items-center gap-3">
      {colors.map((c, i) => (
        <motion.span
          key={c}
          className="bead-ball h-9 w-9"
          initial={{ backgroundColor: '#D8D2C8', scale: 0.6 }}
          animate={{ backgroundColor: c, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 300, damping: 15 }}
        />
      ))}
    </div>
  )
}

/** 02 摆豆：8×8 迷你网格逐格拼出小爱心 */
function DemoPlace() {
  const rows = [
    '........',
    '.XX..XX.',
    'XXXXXXXX',
    'XXXXXXXX',
    '.XXXXXX.',
    '..XXXX..',
    '...XX...',
    '........',
  ]
  const cells: { x: number; y: number }[] = []
  rows.forEach((r, y) => r.split('').forEach((ch, x) => ch === 'X' && cells.push({ x, y })))
  return (
    <div className="grid w-fit grid-cols-8 gap-[3px] rounded-tag bg-white p-3 shadow-card">
      {rows.flatMap((r, y) =>
        r.split('').map((ch, x) => {
          const idx = cells.findIndex((c) => c.x === x && c.y === y)
          return ch === 'X' ? (
            <motion.span
              key={`${x}-${y}`}
              className="h-4 w-4 rounded-cell bg-cherry"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + idx * 0.035, type: 'spring', stiffness: 400, damping: 18 }}
            />
          ) : (
            <span key={`${x}-${y}`} className="h-4 w-4 rounded-cell bg-sand" />
          )
        }),
      )}
    </div>
  )
}

/** 03 导出：图纸图标 + 豆数清单逐行打出 */
function DemoExport() {
  const lines = [
    { color: '#E8452C', text: '樱桃红 R-01 ×42' },
    { color: '#FFFFFF', text: '豆白 N-01 ×18', border: true },
    { color: '#FFC93C', text: '合计 · 60 颗豆' },
  ]
  return (
    <div className="flex items-center gap-5">
      <motion.div
        className="flex h-20 w-16 flex-col items-center justify-center rounded-tag bg-cherry text-white shadow-bead"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 16 }}
      >
        <FileText size={28} />
        <span className="mt-1 font-pixel text-[7px]">PDF</span>
      </motion.div>
      <div className="space-y-2">
        {lines.map((l, i) => (
          <motion.div
            key={l.text}
            className="flex items-center gap-2 font-mono text-sm text-ink/80"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.3, duration: 0.3 }}
          >
            <span
              className={cn('h-3 w-3 rounded-cell', l.border && 'border border-ash/50')}
              style={{ backgroundColor: l.color }}
            />
            {l.text}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/** 04 实拼：成品照片 + 完成印章 */
function DemoFinish() {
  return (
    <div className="relative w-fit">
      <motion.img
        src="/guide-step-finish.png"
        alt="完成的拼豆爱心挂件"
        className="h-36 w-44 rounded-tag object-cover shadow-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.span
        className="absolute -right-3 -top-3 rounded-tag border-[3px] border-matcha px-2 py-1 font-black text-matcha"
        initial={{ scale: 2.2, rotate: -18, opacity: 0 }}
        animate={{ scale: 1, rotate: -12, opacity: 1 }}
        transition={{ delay: 0.55, type: 'spring', stiffness: 260, damping: 14 }}
      >
        完成！
      </motion.span>
    </div>
  )
}

const DEMOS = [DemoPick, DemoPlace, DemoExport, DemoFinish]

/* ---------- 主段落 ---------- */

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=200%',
        pin: true,
        onUpdate: (self) => {
          const idx = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length))
          setActive((prev) => (prev === idx ? prev : idx))
        },
      })
    },
    { scope: sectionRef },
  )

  const step = STEPS[active]
  const Icon = step.icon
  const Demo = DEMOS[active]

  return (
    <section ref={sectionRef} className="bg-cream">
      <div className="mx-auto flex min-h-[100dvh] max-w-site flex-col justify-center px-4 py-16 sm:px-6">
        <SectionTag bead="bg-sky" en="HOW IT WORKS" zh="创作流程" />
        <h2 className="mt-4 text-3xl font-black tracking-[-0.02em] md:text-5xl">
          四步，拼出一幅作品
        </h2>

        <div className="mt-10 flex flex-col gap-10 lg:mt-14 lg:flex-row lg:items-center lg:gap-20">
          {/* 左侧步骤导航 */}
          <ol className="flex shrink-0 flex-row gap-4 lg:flex-col lg:gap-0">
            {STEPS.map((s, i) => (
              <li key={s.num} className="flex items-center gap-3 lg:gap-5">
                <div className="flex flex-col items-center">
                  {/* 数字翻牌 */}
                  <div style={{ perspective: 400 }}>
                    <motion.span
                      key={i === active ? `on-${i}` : `off-${i}-${active}`}
                      initial={i === active ? { rotateX: 90 } : false}
                      animate={{ rotateX: 0 }}
                      transition={{ duration: 0.4 }}
                      className={cn(
                        'block font-mono text-3xl font-medium leading-none transition-colors duration-300 lg:text-[56px]',
                        i === active ? 'text-cherry' : 'text-ash/50',
                      )}
                    >
                      {s.num}
                    </motion.span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <span className="my-2 hidden h-10 border-l border-dashed border-ash/40 lg:block" />
                  )}
                </div>
                <span
                  className={cn(
                    'hidden text-sm font-bold transition-colors duration-300 sm:block lg:text-base',
                    i === active ? 'text-ink' : 'text-ash/60',
                  )}
                >
                  {s.title}
                </span>
              </li>
            ))}
          </ol>

          {/* 右侧步骤卡 */}
          <div className="relative h-[380px] w-full max-w-[520px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="absolute inset-0 flex flex-col rounded-card bg-sand p-8 shadow-card"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-tag bg-white text-cherry shadow-card">
                    <Icon size={24} strokeWidth={2.2} />
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">{step.en}</p>
                  </div>
                </div>
                <p className="mt-4 leading-[1.75] text-ink/75">{step.desc}</p>
                <div className="mt-auto pt-6">
                  <Demo />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
