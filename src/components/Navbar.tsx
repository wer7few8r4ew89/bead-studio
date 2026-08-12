import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/nav-links'
import BeadButton from '@/components/BeadButton'

/** Logo：像素豆子 SVG 图标 */
function LogoBead({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="6" fill="#E8452C" />
      <rect x="4" y="15" width="16" height="5" rx="2.5" fill="#B02E1F" opacity="0.55" />
      <circle cx="12" cy="12" r="3.4" fill="#B02E1F" />
      <circle cx="12" cy="12" r="1.6" fill="#7E2115" />
      <ellipse cx="8.6" cy="8" rx="2.6" ry="1.6" fill="#fff" opacity="0.75" />
    </svg>
  )
}

/** 当前页标记：4 颗彩色小豆子（红黄蓝绿） */
function ActiveBeads() {
  return (
    <span className="absolute -bottom-2 left-1/2 flex w-6 -translate-x-1/2 justify-between">
      {['#E8452C', '#FFC93C', '#3E8EDE', '#58A05C'].map((c) => (
        <span key={c} className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: c }} />
      ))}
    </span>
  )
}

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)

  /* 向下滚隐藏、向上滚滑回 */
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastY && y > 120) setHidden(true)
      else setHidden(false)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 h-[72px] border-b border-dashed border-ash/30',
          'bg-cream/80 backdrop-blur-md transition-transform duration-300',
          hidden && !open ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        <div className="mx-auto flex h-full max-w-site items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <LogoBead className="h-8 w-8" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-ink">豆豆工坊</span>
              <span className="font-pixel text-[8px] text-ash pixel-shadow">BEAD STUDIO</span>
            </span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative py-1 text-[15px] font-bold transition-colors',
                    isActive ? 'text-cherry' : 'text-ink/75 hover:text-cherry',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && <ActiveBeads />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <BeadButton to="/studio" size="sm" className="hidden sm:inline-flex">
              开始拼豆
            </BeadButton>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="打开菜单"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* 移动端全屏抽屉 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-pegboard fixed inset-0 z-40 flex flex-col bg-cream/95 pt-[72px] backdrop-blur-sm lg:hidden"
          >
            <nav className="flex flex-col items-center gap-2 px-6 pt-10" onClick={() => setOpen(false)}>
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ y: -24, scale: 0.6, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={{ delay: 0.06 * i, type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-full px-6 py-3 text-2xl font-black',
                        isActive ? 'text-cherry' : 'text-ink',
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ y: -24, scale: 0.6, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ delay: 0.06 * NAV_LINKS.length, type: 'spring', stiffness: 300, damping: 20 }}
                className="mt-6"
              >
                <BeadButton to="/studio" size="lg">
                  开始拼豆
                </BeadButton>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
