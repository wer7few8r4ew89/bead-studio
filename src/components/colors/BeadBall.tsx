import { cn } from '@/lib/utils'

interface BeadBallProps {
  hex: string
  /** 直径 px */
  size?: number
  className?: string
  /** 是否绘制中心小孔（真实拼豆俯视） */
  hole?: boolean
  title?: string
}

/** 拟物大豆球：inset 高光 + 底部阴影 + 中心小孔 */
export default function BeadBall({ hex, size = 40, className, hole = true, title }: BeadBallProps) {
  return (
    <span
      title={title}
      className={cn('bead-ball relative inline-block shrink-0', className)}
      style={{ width: size, height: size, backgroundColor: hex }}
    >
      {hole && (
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: 'rgba(0,0,0,.22)',
            boxShadow: 'inset 0 2px 3px rgba(0,0,0,.35), inset 0 -1px 1px rgba(255,255,255,.25)',
          }}
        />
      )}
    </span>
  )
}
