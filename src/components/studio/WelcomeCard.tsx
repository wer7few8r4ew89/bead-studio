import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { FileImage, Hand, Pencil } from 'lucide-react'

interface WelcomeCardProps {
  open: boolean
  onFromTemplate: () => void
  onBlank: () => void
}

/** 首次进入的欢迎卡（选择后像素化碎裂消散） */
export default function WelcomeCard({ open, onFromTemplate, onBlank }: WelcomeCardProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-sand/60 p-4 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ y: -24, scale: 0.6, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.94, filter: 'blur(8px)', transition: { duration: 0.4 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-full max-w-md rounded-card bg-bead-white p-7 text-center shadow-hero-card"
          >
            <div className="mb-3 flex justify-center gap-1.5" aria-hidden="true">
              {['#E8452C', '#FFC93C', '#58A05C', '#3E8EDE', '#8B5FBF'].map((c, i) => (
                <motion.span
                  key={c}
                  initial={{ y: -18, scale: 0.5, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 320, damping: 16 }}
                  className="bead-ball h-5 w-5"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-ink">
              欢迎来到工坊 <Hand className="inline h-6 w-6 text-yolk" aria-hidden="true" />
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ash">
              这里是你的数字拼豆工作台。挑一个模板描图开始，或在空白底板上自由摆豆。
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={onFromTemplate}
                className="shadow-bead hover:bg-[#F05036] active:shadow-bead-pressed flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-cherry font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <FileImage size={16} /> 从模板开始
              </button>
              <button
                onClick={onBlank}
                className="shadow-bead hover:bg-[#FFD25E] active:shadow-bead-pressed flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-yolk font-bold text-ink transition-all hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <Pencil size={16} /> 空白创作
              </button>
              <Link
                to="/guide"
                className="flex h-11 items-center justify-center rounded-full border-2 border-ink/70 font-bold text-ink transition-colors hover:border-cherry hover:text-cherry"
              >
                先看看新手指南
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
