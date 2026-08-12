import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { NAV_LINKS } from '@/lib/nav-links'

/** 24 色真实豆色（6 色系 × 4 色） */
const BEAD_24 = [
  '#E8452C', '#F2718C', '#B02E1F', '#FF9D7E',
  '#F08A1D', '#FFC93C', '#FFF3B0', '#C97B12',
  '#58A05C', '#9BCB3C', '#2E7D4F', '#C7E39B',
  '#3E8EDE', '#7FC4E8', '#8B5FBF', '#2C4E8A',
  '#F5A8C0', '#A9714B', '#6B4530', '#FBD9C0',
  '#FFFFFF', '#D8D2C8', '#8A8177', '#2B2622',
]

const BEAD_CODES = [
  'R-01', 'R-02', 'R-03', 'R-04',
  'Y-01', 'Y-02', 'Y-03', 'Y-04',
  'G-01', 'G-02', 'G-03', 'G-04',
  'B-01', 'B-02', 'B-03', 'B-04',
  'P-01', 'P-02', 'P-03', 'P-04',
  'N-01', 'N-02', 'N-03', 'N-04',
]

export default function Footer() {
  return (
    <footer className="relative bg-charcoal text-sand">
      {/* 像素阶梯过渡边 */}
      <div className="pixel-stairs-dark -translate-y-px" aria-hidden="true" />

      <div className="mx-auto grid max-w-site gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 品牌 */}
        <div>
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="6" fill="#E8452C" />
              <rect x="4" y="15" width="16" height="5" rx="2.5" fill="#B02E1F" opacity="0.55" />
              <circle cx="12" cy="12" r="3.4" fill="#B02E1F" />
              <circle cx="12" cy="12" r="1.6" fill="#7E2115" />
              <ellipse cx="8.6" cy="8" rx="2.6" ry="1.6" fill="#fff" opacity="0.75" />
            </svg>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight">豆豆工坊</span>
              <span className="font-pixel text-[8px] text-sand/50">BEAD STUDIO</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-sand/60">
            把灵感，一颗颗拼出来。
          </p>
        </div>

        {/* 快速入口 */}
        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-sand/50">快速入口</h4>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm font-bold text-sand/80 transition-colors hover:text-yolk">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 豆子色卡条 */}
        <div className="md:col-span-2 lg:col-span-2">
          <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-sand/50">24 色豆卡</h4>
          <div className="mt-4 grid grid-cols-12 gap-2 sm:grid-cols-12 lg:grid-cols-12">
            {BEAD_24.map((c, i) => (
              <motion.span
                key={c}
                initial={{ y: -24, scale: 0.6, opacity: 0 }}
                whileInView={{ y: 0, scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  delay: (BEAD_24.length - 1 - i) * 0.04,
                  type: 'spring',
                  stiffness: 320,
                  damping: 18,
                }}
                title={BEAD_CODES[i]}
                className="bead-ball group relative aspect-square w-full cursor-pointer"
                style={{ backgroundColor: c }}
              >
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-tag bg-ink px-1.5 py-0.5 font-mono text-[9px] text-sand opacity-0 transition-opacity group-hover:opacity-100">
                  {BEAD_CODES[i]}
                </span>
              </motion.span>
            ))}
          </div>
          <p className="mt-3 text-xs text-sand/40">hover 查看豆号 · 全部色卡见「豆色材料」页</p>
        </div>
      </div>

      <div className="border-t border-dashed border-sand/15">
        <div className="mx-auto flex max-w-site flex-col items-center justify-between gap-3 px-4 py-6 sm:px-6 md:flex-row">
          <p className="text-xs text-sand/40">© 2025 豆豆工坊 BeadStudio · 备案号占位</p>
          <p className="font-pixel text-[9px] text-sand/50">
            MADE WITH <span className="text-cherry">♥</span> ONE BEAD AT A TIME
          </p>
        </div>
      </div>
    </footer>
  )
}
