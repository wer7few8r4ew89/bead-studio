import { memo } from 'react'
import { getBead } from '@/data/beads'

interface PixelArtProps {
  grid: string[]
  palette: Record<string, string>
  className?: string
  /** 是否绘制豆子高光（缩略图可关闭以提速） */
  glossy?: boolean
}

/** 将像素字符画渲染为 SVG 拼豆图（圆豆 + 高光） */
function PixelArt({ grid, palette, className, glossy = true }: PixelArtProps) {
  const width = Math.max(...grid.map((r) => r.length))
  const height = grid.length
  const cells: { x: number; y: number; hex: string }[] = []
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const id = palette[row[x]]
      if (id) cells.push({ x, y, hex: getBead(id).hex })
    }
  })
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="像素拼豆图案"
      preserveAspectRatio="xMidYMid meet"
    >
      {cells.map((c) => (
        <g key={`${c.x}-${c.y}`}>
          <circle cx={c.x + 0.5} cy={c.y + 0.5} r={0.46} fill={c.hex} />
          {glossy && (
            <ellipse
              cx={c.x + 0.34}
              cy={c.y + 0.3}
              rx={0.15}
              ry={0.1}
              fill="#fff"
              opacity={0.5}
            />
          )}
        </g>
      ))}
    </svg>
  )
}

export default memo(PixelArt)
