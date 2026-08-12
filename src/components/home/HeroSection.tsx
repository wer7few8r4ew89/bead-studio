import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import SectionTag from '@/components/SectionTag'
import BeadButton from '@/components/BeadButton'

gsap.registerPlugin(SplitText, useGSAP)

const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/** 单颗悬浮豆（纯 CSS 圆形拟物） */
function FloatBead({
  color,
  size,
  className,
  depth,
  sx,
  sy,
  delay,
}: {
  color: string
  size: number
  className: string
  depth: number
  sx: ReturnType<typeof useSpring>
  sy: ReturnType<typeof useSpring>
  delay: number
}) {
  const x = useTransform(sx, (v) => v * 20 * depth)
  const y = useTransform(sy, (v) => v * 20 * depth)
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ y: -24, scale: 0.6, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 16 }}
    >
      <motion.div
        className="bead-ball"
        style={{ backgroundColor: color, width: size, height: size, x, y }}
      />
    </motion.div>
  )
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLParagraphElement>(null)

  /* 鼠标视差 */
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18 })
  const sy = useSpring(my, { stiffness: 60, damping: 18 })

  /* 数据条字符级 scatter-in（GSAP SplitText） */
  useGSAP(
    () => {
      if (!barRef.current) return
      const split = new SplitText(barRef.current, { type: 'chars' })
      gsap.from(split.chars, {
        x: () => gsap.utils.random(-48, 48),
        y: () => gsap.utils.random(-32, 32),
        opacity: 0,
        duration: 0.7,
        stagger: 0.018,
        delay: 0.9,
        ease: 'power2.out',
      })
      return () => split.revert()
    },
    { scope: sectionRef },
  )

  const words = ['把灵感，', '一颗颗', '拼出来']

  return (
    <section
      ref={sectionRef}
      className="bg-pegboard relative overflow-hidden"
      onMouseMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5)
        my.set(e.clientY / window.innerHeight - 0.5)
      }}
    >
      <div className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-site items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[55fr_45fr] lg:pb-12">
        {/* 左栏 */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionTag bead="bg-[#F08A1D]" en="PIXEL CRAFT" zh="电子拼豆工作台" />
          </motion.div>

          <h1 className="mt-6 text-[40px] font-black leading-[1.05] tracking-[-0.02em] md:text-[72px]">
            {words.map((w, i) => (
              <motion.span
                key={w}
                className="inline-block"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 * i + 0.1, duration: 0.7, ease: EASE_BOUNCE }}
              >
                {w === '一颗颗' ? (
                  <span className="relative inline-block">
                    一颗颗
                    {/* 像素阶梯下划线：宽 0→100% */}
                    <motion.span
                      aria-hidden="true"
                      className="absolute -bottom-[0.1em] left-0 right-0 h-[0.14em] origin-left bg-cherry"
                      style={{
                        clipPath:
                          'polygon(0 100%,0 50%,12.5% 50%,12.5% 0,25% 0,25% 50%,37.5% 50%,37.5% 100%,50% 100%,50% 50%,62.5% 50%,62.5% 0,75% 0,75% 50%,87.5% 50%,87.5% 100%,100% 100%)',
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                    />
                  </span>
                ) : (
                  w
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-[1.75] text-ash"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            24 色真实豆色 · 百款像素图案 · 自动算豆清单。在浏览器里摆好每一颗豆，再照着图纸拼出真的。
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            <BeadButton to="/studio" size="lg">
              开始拼豆 →
            </BeadButton>
            <BeadButton to="/patterns" variant="ghost" size="lg">
              逛逛图案库
            </BeadButton>
          </motion.div>

          <p
            ref={barRef}
            className="mt-10 font-mono text-sm font-medium tracking-[0.12em] text-ink/70"
          >
            24 COLORS · 100+ PATTERNS · ∞ IDEAS
          </p>
        </div>

        {/* 右栏 */}
        <motion.div
          className="relative"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: EASE_BOUNCE }}
        >
          <div className="overflow-hidden rounded-[24px] shadow-hero-card">
            <img
              src="/hero-beads-scatter.png"
              alt="散落在奶油色桌垫上的彩色拼豆，部分排成心形"
              className="block aspect-[4/3] w-full object-cover"
            />
          </div>
          <FloatBead color="#E8452C" size={48} depth={1} sx={sx} sy={sy} delay={0.7} className="-left-4 top-8" />
          <FloatBead color="#FFC93C" size={36} depth={0.7} sx={sx} sy={sy} delay={0.8} className="-right-3 top-1/3" />
          <FloatBead color="#3E8EDE" size={28} depth={0.5} sx={sx} sy={sy} delay={0.9} className="bottom-6 left-10" />
        </motion.div>
      </div>

      {/* 滚动提示 */}
      <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 md:flex">
        <div className="relative h-10 w-4">
          <span className="absolute left-1/2 top-0 h-full w-px border-l border-dashed border-ash/50" />
          <span className="bead-ball absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 animate-scroll-drop bg-cherry" />
        </div>
        <span className="text-xs text-ash">向下滚动</span>
      </div>
    </section>
  )
}
