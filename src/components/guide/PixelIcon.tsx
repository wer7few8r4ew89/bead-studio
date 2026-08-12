import { memo } from 'react'

export type PixelIconName = 'palette' | 'brush' | 'iron' | 'medal' | 'warning'

interface Cell {
  x: number
  y: number
  c?: string
}

const INK = '#2B2622'
const ASH = '#8A8177'
const CREAM = '#FBF6EE'

/** 生成一行水平像素块（12×12 网格，每格 2px） */
const run = (y: number, x0: number, x1: number, c?: string): Cell[] =>
  Array.from({ length: x1 - x0 + 1 }, (_, k) => ({ x: x0 + k, y, c }))

const ICONS: Record<PixelIconName, Cell[]> = {
  /* 像素调色盘 */
  palette: [
    ...run(2, 4, 7),
    ...run(3, 2, 9),
    ...run(4, 1, 10),
    ...run(5, 1, 10),
    ...run(6, 1, 10),
    ...run(7, 1, 9),
    ...run(8, 1, 8),
    ...run(9, 2, 8),
    ...run(10, 4, 7),
    { x: 3, y: 4, c: '#E8452C' },
    { x: 6, y: 3, c: '#3E8EDE' },
    { x: 8, y: 5, c: '#FFC93C' },
    { x: 4, y: 6, c: '#58A05C' },
    { x: 6, y: 8, c: '#F2718C' },
  ],
  /* 像素画笔 */
  brush: [
    ...run(0, 5, 6),
    ...run(1, 5, 6),
    ...run(2, 5, 6),
    ...run(3, 5, 6),
    ...run(4, 5, 6),
    ...run(5, 5, 6),
    ...run(6, 4, 7, ASH),
    ...run(7, 4, 7, ASH),
    ...run(8, 4, 7, '#A9714B'),
    ...run(9, 5, 6, '#A9714B'),
    ...run(10, 5, 6, '#E8452C'),
  ],
  /* 像素熨斗 */
  iron: [
    ...run(3, 3, 8),
    { x: 3, y: 4 },
    { x: 8, y: 4 },
    ...run(5, 2, 9),
    ...run(6, 1, 10),
    { x: 0, y: 6 },
    ...run(7, 0, 11),
    ...run(8, 0, 11, ASH),
    ...run(9, 0, 11, ASH),
    { x: 4, y: 1, c: ASH },
    { x: 7, y: 0, c: ASH },
    { x: 9, y: 1, c: ASH },
  ],
  /* 像素奖章 */
  medal: [
    ...run(0, 3, 4, '#E8452C'),
    ...run(0, 7, 8, '#3E8EDE'),
    ...run(1, 4, 5, '#E8452C'),
    ...run(1, 6, 7, '#3E8EDE'),
    ...run(3, 4, 7, '#FFC93C'),
    ...run(4, 3, 8, '#FFC93C'),
    ...run(5, 3, 8, '#FFC93C'),
    ...run(6, 3, 8, '#FFC93C'),
    ...run(7, 4, 7, '#FFC93C'),
    { x: 5, y: 4, c: '#C97B12' },
    { x: 6, y: 4, c: '#C97B12' },
    { x: 5, y: 5, c: '#C97B12' },
    { x: 6, y: 5, c: '#C97B12' },
  ],
  /* 像素警示三角 */
  warning: [
    ...run(2, 5, 6, '#E8452C'),
    ...run(3, 4, 7, '#E8452C'),
    ...run(4, 3, 8, '#E8452C'),
    ...run(5, 2, 9, '#E8452C'),
    ...run(6, 1, 10, '#E8452C'),
    ...run(7, 1, 10, '#E8452C'),
    ...run(3, 5, 6, CREAM),
    ...run(4, 5, 6, CREAM),
    ...run(6, 5, 6, CREAM),
  ],
}

interface PixelIconProps {
  name: PixelIconName
  size?: number
  className?: string
}

/** 8-bit 像素风 SVG 图标：24px 网格、2px 像素块 */
export default memo(function PixelIcon({ name, size = 24, className }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {ICONS[name].map((cell, i) => (
        <rect key={i} x={cell.x * 2} y={cell.y * 2} width={2} height={2} fill={cell.c ?? INK} />
      ))}
    </svg>
  )
})
