import { motion } from 'framer-motion'
import SectionTag from '@/components/SectionTag'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQS = [
  {
    q: '电子图纸和实体豆颜色对不上怎么办？',
    a: '工坊调色盘按真实豆色校准，购买时认准豆号（如 R-01）。不同品牌之间色名可能不同，但色值接近——对照豆号买，就不会踩雷。',
  },
  {
    q: '没有熨斗可以定型吗？',
    a: '可以用直发夹板低温替代，垫上助烫纸分区夹烫；或者选择免烫的拼豆胶水方案，更适合只做摆件、装饰品的场景。',
  },
  {
    q: '烫完一面还是两面？',
    a: '双面烫最牢固，适合经常把玩的钥匙扣；单面烫能保留正面的颗粒感，看起来更立体，适合展示类挂件。',
  },
  {
    q: '图纸可以商用吗？',
    a: '图案库中标注「可商用」的模板可自由使用；其余模板仅限个人学习与非盈利分享，转载请注明出处。',
  },
  {
    q: '豆子总是拼错行怎么办？',
    a: '导出的 PDF 图纸自带坐标行号。拼完一行，用尺子或便签遮住下一行，对照行号逐行推进，就不容易错位了。',
  },
]

/** Section 3 · 常见问题 FAQ（shadcn Accordion 定制） */
export default function GuideFaq() {
  return (
    <section className="mx-auto max-w-[760px] px-4 py-20 sm:px-6 md:py-28">
      <div className="text-center">
        <SectionTag bead="bg-yolk" en="FAQ" zh="常见问题" />
        <h2 className="mt-5 text-3xl font-black tracking-tight text-ink sm:text-4xl">大家常问</h2>
      </div>

      <div className="mt-10 rounded-card border border-ink/5 bg-white px-5 shadow-card sm:px-7">
        <Accordion type="single" collapsible>
          {FAQS.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
            >
              <AccordionItem value={`faq-${i}`} className="border-ink/10">
                <AccordionTrigger className="group py-5 text-left text-[15px] font-bold text-ink hover:no-underline sm:text-base [&[data-state=open]>svg]:text-cherry">
                  <span className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ash/40 shadow-[inset_0_-1px_0_rgba(0,0,0,.2)] transition-colors duration-300 group-data-[state=open]:bg-cherry" />
                    {f.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-7 text-[15px] leading-[1.75] text-ash">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
                  >
                    {f.a}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
