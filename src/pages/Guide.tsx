import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SectionTag from '@/components/SectionTag'
import StepProgress from '@/components/guide/StepProgress'
import GuideSteps from '@/components/guide/GuideSteps'
import GuideFaq from '@/components/guide/GuideFaq'
import GuideCta from '@/components/guide/GuideCta'

/** H1 词级切分（上浮 stagger 0.1s） */
const TITLE_WORDS = ['从', '一颗豆，', '到', '一件作品']

export default function Guide() {
  const [activeStep, setActiveStep] = useState(0)

  /* 滚动到对应步骤块时点亮进度条豆球 */
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-guide-step]'))
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const n = Number((entry.target as HTMLElement).dataset.guideStep)
            if (n >= 1 && n <= 4) setActiveStep(n)
          }
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const scrollToStep = (n: number) => {
    document.getElementById(`guide-step-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-cream">
      {/* Section 1 · 页头 */}
      <section className="bg-pegboard">
        <div className="mx-auto max-w-site px-4 pb-12 pt-16 text-center sm:px-6 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <SectionTag bead="bg-matcha" en="HOW TO" zh="新手指南" />
          </motion.div>

          <h1 className="mt-6 text-[40px] font-black leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[72px]">
            {TITLE_WORDS.map((w, i) => (
              <motion.span
                key={w}
                className="inline-block"
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ash sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: 'easeOut' }}
          >
            电子拼豆画图，实体拼豆成形。四步走完，你也会烫出自己的第一件作品。
          </motion.p>
        </div>
      </section>

      {/* 四步进度预览条（sticky 跟随滚动，点亮当前步骤） */}
      <div className="sticky top-[84px] z-30 px-4">
        <StepProgress active={activeStep} onSelect={scrollToStep} />
      </div>

      {/* Section 2 · 四步教程 */}
      <GuideSteps />

      {/* Section 3 · 常见问题 FAQ */}
      <GuideFaq />

      {/* Section 4 · 终段 CTA */}
      <GuideCta />
    </div>
  )
}
