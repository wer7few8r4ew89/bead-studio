import type { ReactNode, MouseEventHandler } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

type Variant = 'cherry' | 'yolk' | 'ghost'
type Size = 'md' | 'lg' | 'sm'

interface BeadButtonProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  to?: string
  href?: string
  onClick?: MouseEventHandler
  className?: string
  type?: 'button' | 'submit'
}

const variantCls: Record<Variant, string> = {
  cherry: 'bg-cherry text-white shadow-bead hover:bg-[#F05036]',
  yolk: 'bg-yolk text-ink shadow-bead hover:bg-[#FFD25E]',
  ghost:
    'bg-transparent text-ink border-2 border-ink/70 hover:border-cherry hover:text-cherry',
}

const sizeCls: Record<Size, string> = {
  sm: 'h-9 px-5 text-sm',
  md: 'h-12 px-7 text-base',
  lg: 'h-14 px-9 text-lg',
}

/**
 * 豆钮：胶囊形、inset 高光阴影模拟圆柱豆。
 * hover 上浮 2px；active 下压（inset 反转 + translateY 2px）。
 */
export default function BeadButton({
  children,
  variant = 'cherry',
  size = 'md',
  to,
  href,
  onClick,
  className,
  type = 'button',
}: BeadButtonProps) {
  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-wide',
    'transition-all duration-200 ease-bounce select-none cursor-pointer',
    'hover:-translate-y-0.5 active:translate-y-0.5',
    variant !== 'ghost' && 'active:shadow-bead-pressed',
    variantCls[variant],
    sizeCls[size],
    className,
  )
  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  )
}
