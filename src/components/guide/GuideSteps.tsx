import { memo } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import BeadButton from '@/components/BeadButton'
import PixelIcon from '@/components/guide/PixelIcon'
import type { PixelIconName } from '@/components/guide/PixelIcon'
import MiniBeadDemo from '@/components/guide/MiniBeadDemo'

/* 安全提示卡的循环闪烁警示图标（进入视口后开始，独立 memo 组件隔离无限动画） */
const BlinkingWarning = memo(function BlinkingWarning() {
  return (
    <motion.span
      className="mt-0.5 inline-flex shrink-0"
      initial={{ opacity: 1 }}
      whileInView={{ opacity: [1, 0.5, 1] }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <PixelIcon name="warning" size={26} />
    </motion.span>
  )
})

interface StepBlockProps {
  stepId: number
  num: string
  icon: PixelIconName
  chipBg: string
  title: string
  paragraphs: string[]
  tags?: string[]
  /** true = 图片在左、文字在右（偶数步 Z 字动线） */
  reverse?: boolean
  /** 奖章图标 360° 翻转回弹 */
  flipIcon?: boolean
  media: ReactNode
  extra?: ReactNode
}

function StepBlock({
  stepId,
  num,
  icon,
  chipBg,
  title,
  paragraphs,
  tags,
  reverse = false,
  flipIcon = false,
  media,
  extra,
}: StepBlockProps) {
  const chip = (
    <span className={cn('inline-flex rounded-xl p-3', chipBg)}>
      <PixelIcon name={icon} size={30} />
    </span>
  )
  return (
    <section
      id={`guide-step-${stepId}`}
      data-guide-step={stepId}
      className="relative scroll-mt-44"
    >
      {/* 左侧竖向步骤编号大字（背景装饰） */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 left-0 hidden select-none flex-col font-mono text-[96px] font-medium leading-[0.85] text-ash/20 lg:flex"
      >
        {num.split('').map((d) => (
          <span key={d}>{d}</span>
        ))}
      </span>

      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* 文字侧 */}
        <motion.div
          className={cn('relative lg:pl-16', reverse && 'lg:order-2 lg:pl-0')}
          initial={{ opacity: 0, x: reverse ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {flipIcon ? (
            <motion.div
              className="w-fit"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 0 }}
              whileInView={{ rotateY: 360 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 120, damping: 12 }}
            >
              {chip}
            </motion.div>
          ) : (
            chip
          )}
          <h2 className="mt-5 text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h2>
          {paragraphs.map((p) => (
            <p key={p.slice(0, 12)} className="mt-4 text-[15px] leading-[1.75] text-ash sm:text-base">
              {p}
            </p>
          ))}
          {tags && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-tag bg-sand px-2.5 py-1 text-xs font-bold text-ink/70"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {extra}
        </motion.div>

        {/* 图片 / 演示侧 */}
        <motion.div
          className={cn(reverse && 'lg:order-1')}
          initial={{ opacity: 0, x: reverse ? -60 : 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {media}
        </motion.div>
      </div>
    </section>
  )
}

function StepImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-card border border-ink/5 shadow-hero-card">
      <img src={src} alt={alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
    </div>
  )
}

/** Section 2 · 四步教程（步骤式滚动叙事，Z 字阅读动线） */
export default function GuideSteps() {
  return (
    <div className="mx-auto max-w-site space-y-24 px-4 py-20 sm:px-6 md:space-y-32 md:py-28">
      {/* 步骤 01 · 选豆备料 */}
      <StepBlock
        stepId={1}
        num="01"
        icon="palette"
        chipBg="bg-cherry/10"
        title="先挑好你的豆子"
        paragraphs={[
          '新手建议从 5mm 标准豆入手：大小适中、好夹好烫，图案细节也足够表现。颜色不用贪多，必备六色——白、黑、红、黄、蓝、绿，就能覆盖八成入门图案。',
          '底板选方形 29×29 最通用，拼小挂件、杯垫都够用；再配一把弯头镊子和几张助烫纸，你的工作台就齐了。',
        ]}
        tags={['5mm 标准豆', '必备六色', '29×29 方形底板', '弯头镊子', '助烫纸']}
        media={
          <StepImage
            src="/guide-step-pegboard.png"
            alt="用镊子把一颗红色拼豆放上白色底板"
          />
        }
        extra={
          <motion.div
            className="mt-6 flex items-start gap-3 rounded-card border border-yolk/50 bg-yolk/15 p-4"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="text-xl leading-none" aria-hidden="true">💰</span>
            <p className="text-sm font-bold text-ink">
              新手预算参考：
              <span className="font-normal text-ink/70">六色豆 + 底板 + 配件 ≈ 一杯奶茶钱</span>
            </p>
          </motion.div>
        }
      />

      {/* 步骤 02 · 在豆豆工坊画图纸 */}
      <StepBlock
        stepId={2}
        num="02"
        icon="brush"
        chipBg="bg-grape/10"
        title="打开工坊，把图案拼出来"
        reverse
        paragraphs={[
          '不想从零开始？图案库里有现成的模板，一键载入工坊后还能改色改细节；喜欢原创，也可以直接描图填充，画属于你的图纸。',
          '画布会实时统计每色用豆数量——记住一句话：图纸上是什么色，就买什么豆，照着豆号配货不踩雷。先在下面这块迷你底板上试试手感：',
        ]}
        tags={['图案库模板', '描图填充', '实时用豆统计', '豆号配货']}
        media={<MiniBeadDemo />}
        extra={
          <div className="mt-6">
            <BeadButton to="/studio" size="sm">
              去工坊试试 →
            </BeadButton>
          </div>
        }
      />

      {/* 步骤 03 · 摆豆与熨烫 */}
      <StepBlock
        stepId={3}
        num="03"
        icon="iron"
        chipBg="bg-sky/10"
        title="照着图纸摆，低温慢慢烫"
        paragraphs={[
          '把图纸打印出来（或打开平板对照），用镊子逐色摆豆，拼完一行检查一行，错行是新手最大的敌人。',
          '摆好后盖上助烫纸，熨斗调到中低温，画小圈匀速熨烫 10–20 秒，看到豆面微微融合就停；想要更牢固，翻面再烫一次。',
        ]}
        tags={['逐色摆豆', '助烫纸', '中低温打圈', '10–20 秒', '翻面再烫']}
        media={
          <StepImage
            src="/guide-step-iron.png"
            alt="拼豆作品覆盖烘焙纸用熨斗低温熨烫"
          />
        }
        extra={
          <motion.div
            className="mt-6 flex items-start gap-3 rounded-card border border-cherry/30 bg-cherry/10 p-4"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 18 }}
          >
            <BlinkingWarning />
            <div>
              <p className="text-sm font-black text-cherry">安全第一</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink/75">
                熨烫请由成人操作；儿童请在家长陪同下进行。
              </p>
            </div>
          </motion.div>
        }
      />

      {/* 步骤 04 · 冷却定型与展示 */}
      <StepBlock
        stepId={4}
        num="04"
        icon="medal"
        chipBg="bg-matcha/10"
        title="压平冷却，作品诞生"
        reverse
        flipIcon
        paragraphs={[
          '烫完别急着上手：趁热盖回助烫纸，压一本厚书或平板重物 5 分钟，能有效防止翘边。',
          '冷却定型后，穿上钥匙扣就是挂件，配上软木底就是杯垫，贴颗磁贴就能上冰箱——别忘了拍照，晒出你的第一件作品！',
        ]}
        tags={['压重物 5 分钟', '钥匙扣挂件', '杯垫', '冰箱贴']}
        media={
          <StepImage
            src="/guide-step-finish.png"
            alt="完成的拼豆爱心挂件在阳光下透光展示"
          />
        }
        extra={
          <div className="group relative mt-6 inline-flex">
            <BeadButton variant="ghost" size="sm" onClick={(e) => e.preventDefault()}>
              晒作品
            </BeadButton>
            <span
              role="tooltip"
              className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-tag bg-ink px-2.5 py-1 text-xs text-sand opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              社区功能即将上线
            </span>
          </div>
        }
      />
    </div>
  )
}
