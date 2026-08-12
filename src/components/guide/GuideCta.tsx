import { memo } from 'react'
import { motion } from 'framer-motion'
import BeadButton from '@/components/BeadButton'

/* 持续轻微脉动的 CTA 按钮（独立 memo 组件隔离无限动画） */
const PulseButton = memo(function PulseButton() {
  return (
    <motion.div
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <BeadButton
        to="/studio"
        size="lg"
        variant="cherry"
        className="bg-white text-cherry hover:bg-sand"
      >
        进入创作工坊 →
      </BeadButton>
    </motion.div>
  )
})

/** Section 4 · 终段 CTA：sky 蓝底圆角大卡 */
export default function GuideCta() {
  return (
    <section className="mx-auto max-w-site px-4 pb-20 sm:px-6 md:pb-28">
      <motion.div
        className="bg-pegboard-light relative overflow-hidden rounded-card bg-sky px-6 py-16 text-center shadow-hero-card sm:px-12 md:py-20"
        initial={{ scale: 0.94, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          看懂了？现在去拼第一颗豆
        </h2>
        <p className="mt-4 text-base text-white/85 sm:text-lg">模板、配色、统计都已备好</p>
        <div className="mt-10 flex justify-center">
          <PulseButton />
        </div>
      </motion.div>
    </section>
  )
}
