import { cn } from '@/lib/utils'

interface SectionTagProps {
  /** 小圆豆颜色类名，如 bg-cherry */
  bead?: string
  /** 拉丁等宽大写短句，如 "PATTERN PICKS" */
  en: string
  /** 中文标签 */
  zh: string
  dark?: boolean
  className?: string
}

/** 段落标签：左侧 8px 彩色圆豆 + 等宽大写拉丁字 + 中文 */
export default function SectionTag({
  bead = 'bg-cherry',
  en,
  zh,
  dark = false,
  className,
}: SectionTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 rounded-tag border px-3.5 py-1.5',
        dark ? 'border-white/20 bg-white/5' : 'border-ink/10 bg-white/60',
        className,
      )}
    >
      <span className={cn('h-2 w-2 rounded-full shadow-[inset_0_-1px_0_rgba(0,0,0,.2)]', bead)} />
      <span className={cn('font-mono text-[11px] font-medium uppercase tracking-[0.18em]', dark ? 'text-sand/70' : 'text-ash')}>
        {en}
      </span>
      <span className={cn('text-[13px] font-bold', dark ? 'text-sand' : 'text-ink')}>{zh}</span>
    </span>
  )
}
