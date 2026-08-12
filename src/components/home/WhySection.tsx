import { motion } from 'framer-motion'
import { Palette, ClipboardList, ScrollText } from 'lucide-react'
import SectionTag from '@/components/SectionTag'

const FEATURES = [
  {
    icon: Palette,
    color: 'text-cherry',
    title: '像素调色盘',
    desc: '真实豆色 1:1 映射，图纸上的颜色就是你买到的颜色。',
  },
  {
    icon: ClipboardList,
    color: 'text-matcha',
    title: '自动算豆清单',
    desc: '每种颜色用几颗，实时统计。拿着清单去配豆，一颗不浪费。',
  },
  {
    icon: ScrollText,
    color: 'text-sky',
    title: '图纸随身带',
    desc: '导出高清图纸 PDF 或分享链接，手机平板随时对照着拼。',
  },
]

export default function WhySection() {
  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="mx-auto grid max-w-site items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        {/* 左文 */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTag bead="bg-grape" en="WHY DIGITAL" zh="为什么选择电子拼豆" />
          <h2 className="mt-4 text-3xl font-black leading-[1.15] tracking-[-0.02em] md:text-5xl">
            先拼个痛快，
            <br />
            再买豆不迟
          </h2>
          <p className="mt-6 max-w-md leading-[1.75] text-ash">
            实体拼豆最痛的三件事：配色翻车、豆不够了、图纸丢了。电子拼豆先试错，零成本。
          </p>
        </motion.div>

        {/* 右表：三张特性行卡 */}
        <motion.div
          className="space-y-5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={{
                hidden: { y: 48, opacity: 0 },
                show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
              }}
              className="flex items-center gap-5 rounded-card bg-bead-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <motion.span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-tag bg-sand ${f.color}`}
                variants={{
                  hidden: { rotate: -8 },
                  show: { rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 12, delay: 0.15 } },
                }}
              >
                <f.icon size={26} strokeWidth={2.2} />
              </motion.span>
              <div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ash">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
