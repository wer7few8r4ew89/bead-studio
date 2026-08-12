import { useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { BeadColor } from '@/lib/bead-colors'
import type { Tool } from '@/lib/studio-engine'
import { EMPTY, floodFill, lineCells } from '@/lib/studio-engine'
import { drawBead } from '@/lib/studio-export'

const RULER = 26
const ZOOM_MIN = 0.5
const ZOOM_MAX = 4

interface View {
  zoom: number
  panX: number
  panY: number
}

interface BeadCanvasProps {
  cols: number
  rows: number
  gridRef: MutableRefObject<Int16Array>
  palette: BeadColor[]
  tool: Tool
  colorIdx: number
  mirror: boolean
  gridOn: boolean
  gridMajor: number
  dotsOn: boolean
  boardWhite: boolean
  overlayImg: HTMLImageElement | null
  overlayOpacity: number
  /** 递增触发“摆豆雨”入场动画 */
  rainKey: number
  onPaintStart: () => void
  onPaint: () => void
  onPickColor: (idx: number) => void
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/* 像素风自定义光标（16×16 SVG data URI） */
const ERASER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect x='2' y='7' width='10' height='7' fill='%23F2718C' stroke='%232B2622'/%3E%3Crect x='2' y='7' width='4' height='7' fill='%237FC4E8' stroke='%232B2622'/%3E%3C/svg%3E") 2 14, crosshair`
const PICKER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath d='M11 1l4 4-7 7-4-4z' fill='%233E8EDE' stroke='%232B2622'/%3E%3Cpath d='M5 9l-4 5 1 1 5-4z' fill='%232B2622'/%3E%3C/svg%3E") 2 14, crosshair`

export default function BeadCanvas({
  cols,
  rows,
  gridRef,
  palette,
  tool,
  colorIdx,
  mirror,
  gridOn,
  gridMajor,
  dotsOn,
  boardWhite,
  overlayImg,
  overlayOpacity,
  rainKey,
  onPaintStart,
  onPaint,
  onPickColor,
}: BeadCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewRef = useRef<View>({ zoom: 1, panX: 0, panY: 0 })
  const hoverRef = useRef<{ x: number; y: number } | null>(null)
  const animsRef = useRef<Map<number, number>>(new Map())
  const needsRenderRef = useRef(true)
  const spaceRef = useRef(false)
  const panningRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const pinchRef = useRef<{ d: number; midX: number; midY: number; zoom: number; panX: number; panY: number } | null>(null)
  const drawingRef = useRef(false)
  const lastCellRef = useRef<{ x: number; y: number } | null>(null)
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  /* 最新 props 快照，供 rAF 渲染读取 */
  const propsRef = useRef({ cols, rows, palette, tool, colorIdx, mirror, gridOn, gridMajor, dotsOn, boardWhite, overlayImg, overlayOpacity })
  propsRef.current = { cols, rows, palette, tool, colorIdx, mirror, gridOn, gridMajor, dotsOn, boardWhite, overlayImg, overlayOpacity }

  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null)
  const [zoomPct, setZoomPct] = useState(100)
  const [spaceHeld, setSpaceHeld] = useState(false)

  const markDirty = useCallback(() => {
    needsRenderRef.current = true
  }, [])

  /* 画布布局：格子像素大小与原点（CSS px 坐标系） */
  const layout = useCallback((w: number, h: number) => {
    const { zoom, panX, panY } = viewRef.current
    const availW = w - RULER - 12
    const availH = h - RULER - 12
    const base = Math.max(2, Math.min(availW / propsRef.current.cols, availH / propsRef.current.rows))
    const cs = base * zoom
    const ox = RULER + (availW - propsRef.current.cols * cs) / 2 + panX
    const oy = RULER + (availH - propsRef.current.rows * cs) / 2 + panY
    return { cs, ox, oy }
  }, [])

  const eventToCell = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const { cs, ox, oy } = layout(rect.width, rect.height)
      return {
        x: Math.floor((px - ox) / cs),
        y: Math.floor((py - oy) / cs),
        inBounds: false as boolean,
        px,
        py,
      }
    },
    [layout],
  )

  /* ---------- 渲染 ---------- */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    const p = propsRef.current
    const grid = gridRef.current
    const { cs, ox, oy } = layout(w, h)
    const now = performance.now()

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    /* 底板卡片 */
    ctx.save()
    ctx.shadowColor = 'rgba(43,38,34,0.14)'
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 8
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.roundRect(ox - 6, oy - 6, p.cols * cs + 12, p.rows * cs + 12, 10)
    ctx.fill()
    ctx.restore()

    /* 底板本体（白 / 透明棋盘） */
    ctx.save()
    ctx.beginPath()
    ctx.rect(ox, oy, p.cols * cs, p.rows * cs)
    ctx.clip()
    if (p.boardWhite) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(ox, oy, p.cols * cs, p.rows * cs)
    } else {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(ox, oy, p.cols * cs, p.rows * cs)
      const s = Math.max(6, cs / 2)
      ctx.fillStyle = '#F1EBE0'
      for (let yy = 0; yy * s < p.rows * cs; yy++) {
        for (let xx = (yy % 2); xx * s < p.cols * cs; xx += 2) {
          ctx.fillRect(ox + xx * s, oy + yy * s, s, s)
        }
      }
    }

    /* 底板凹槽圆点（空格） */
    if (p.dotsOn && cs >= 5) {
      ctx.fillStyle = 'rgba(43,38,34,0.09)'
      for (let y = 0; y < p.rows; y++) {
        for (let x = 0; x < p.cols; x++) {
          if (grid[y * p.cols + x] >= 0) continue
          ctx.beginPath()
          ctx.arc(ox + x * cs + cs / 2, oy + y * cs + cs / 2, Math.max(0.8, cs * 0.08), 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    /* 豆子 */
    const anims = animsRef.current
    for (let y = 0; y < p.rows; y++) {
      for (let x = 0; x < p.cols; x++) {
        const idx = y * p.cols + x
        const v = grid[idx]
        if (v < 0 || !p.palette[v]) continue
        const start = anims.get(idx)
        if (start !== undefined && now < start) continue /* 摆豆雨：尚未落位 */
        const bx = ox + x * cs
        const by = oy + y * cs
        if (start !== undefined) {
          const t = (now - start) / 260
          if (t >= 1) {
            anims.delete(idx)
            drawBead(ctx, bx, by, cs, p.palette[v].hex)
          } else {
            const s = 0.6 + 0.4 * easeOutBack(t)
            ctx.save()
            ctx.translate(bx + cs / 2, by + cs / 2)
            ctx.scale(Math.max(0.05, s), Math.max(0.05, s))
            drawBead(ctx, -cs / 2, -cs / 2, cs, p.palette[v].hex)
            ctx.restore()
            /* yolk 扩散环 */
            const rt = Math.min(1, (now - start) / 300)
            ctx.strokeStyle = `rgba(255,201,60,${0.8 * (1 - rt)})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(bx + cs / 2, by + cs / 2, cs * 0.5 + rt * cs * 0.45, 0, Math.PI * 2)
            ctx.stroke()
          }
        } else {
          drawBead(ctx, bx, by, cs, p.palette[v].hex)
        }
      }
    }

    /* 模板叠加虚影 */
    if (p.overlayImg) {
      ctx.globalAlpha = p.overlayOpacity
      ctx.drawImage(p.overlayImg, ox, oy, p.cols * cs, p.rows * cs)
      ctx.globalAlpha = 1
    }

    /* 网格线 */
    if (p.gridOn && cs >= 4) {
      ctx.strokeStyle = '#E5DCCB'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      for (let x = 0; x <= p.cols; x++) {
        ctx.moveTo(ox + x * cs + 0.5, oy)
        ctx.lineTo(ox + x * cs + 0.5, oy + p.rows * cs)
      }
      for (let y = 0; y <= p.rows; y++) {
        ctx.moveTo(ox, oy + y * cs + 0.5)
        ctx.lineTo(ox + p.cols * cs, oy + y * cs + 0.5)
      }
      ctx.stroke()
      ctx.setLineDash([])
      if (p.gridMajor > 1) {
        ctx.strokeStyle = '#D8CDB6'
        ctx.beginPath()
        for (let x = 0; x <= p.cols; x += p.gridMajor) {
          ctx.moveTo(ox + x * cs + 0.5, oy)
          ctx.lineTo(ox + x * cs + 0.5, oy + p.rows * cs)
        }
        for (let y = 0; y <= p.rows; y += p.gridMajor) {
          ctx.moveTo(ox, oy + y * cs + 0.5)
          ctx.lineTo(ox + p.cols * cs, oy + y * cs + 0.5)
        }
        ctx.stroke()
      }
    }

    /* hover 行列高亮 */
    const hv = hoverRef.current
    if (hv && hv.x >= 0 && hv.x < p.cols && hv.y >= 0 && hv.y < p.rows) {
      ctx.fillStyle = 'rgba(255,201,60,0.12)'
      ctx.fillRect(ox, oy + hv.y * cs, p.cols * cs, cs)
      ctx.fillRect(ox + hv.x * cs, oy, cs, p.rows * cs)
      ctx.strokeStyle = 'rgba(255,201,60,0.9)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(ox + hv.x * cs + 0.75, oy + hv.y * cs + 0.75, cs - 1.5, cs - 1.5)
    }
    ctx.restore()

    /* 坐标尺 */
    if (cs >= 6) {
      ctx.font = '500 9px "DM Mono", monospace'
      ctx.textBaseline = 'middle'
      for (let x = 0; x < p.cols; x++) {
        if (x % 5 !== 0 && x !== p.cols - 1) continue
        const lx = ox + x * cs + cs / 2
        if (lx < RULER || lx > w - 8) continue
        ctx.fillStyle = hv && hv.x === x ? '#E8452C' : 'rgba(138,129,119,0.85)'
        ctx.textAlign = 'center'
        ctx.fillText(String(x + 1), lx, 12)
      }
      for (let y = 0; y < p.rows; y++) {
        if (y % 5 !== 0 && y !== p.rows - 1) continue
        const ly = oy + y * cs + cs / 2
        if (ly < RULER || ly > h - 8) continue
        ctx.fillStyle = hv && hv.y === y ? '#E8452C' : 'rgba(138,129,119,0.85)'
        ctx.textAlign = 'right'
        ctx.fillText(String(y + 1), RULER - 6, ly)
      }
      ctx.textAlign = 'left'
    }
  }, [gridRef, layout])

  /* rAF 渲染循环：dirty 或有动画时重绘 */
  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (needsRenderRef.current || animsRef.current.size > 0) {
        needsRenderRef.current = false
        draw()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [draw])

  /* 尺寸自适应 */
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      markDirty()
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [markDirty])

  /* props 变化 → 重绘 */
  useEffect(markDirty)

  /* 摆豆雨入场 */
  useEffect(() => {
    if (rainKey <= 0) return
    const grid = gridRef.current
    const filled: number[] = []
    for (let i = 0; i < grid.length; i++) if (grid[i] >= 0) filled.push(i)
    if (!filled.length) return
    const step = Math.min(12, 1200 / filled.length)
    const now = performance.now()
    filled.forEach((idx, i) => animsRef.current.set(idx, now + i * step))
    markDirty()
  }, [rainKey, gridRef, markDirty])

  /* 空格临时抓手 */
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || (el as HTMLElement).isContentEditable)
    }
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping()) {
        spaceRef.current = true
        setSpaceHeld(true)
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceRef.current = false
        setSpaceHeld(false)
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  /* ---------- 绘制操作 ---------- */
  const setCell = useCallback(
    (x: number, y: number, v: number) => {
      const p = propsRef.current
      if (x < 0 || x >= p.cols || y < 0 || y >= p.rows) return
      const grid = gridRef.current
      const idx = y * p.cols + x
      if (grid[idx] === v) return
      grid[idx] = v
      if (v >= 0) animsRef.current.set(idx, performance.now())
      if (p.mirror) {
        const mx = p.cols - 1 - x
        const mid = y * p.cols + mx
        if (grid[mid] !== v) {
          grid[mid] = v
          if (v >= 0) animsRef.current.set(mid, performance.now())
        }
      }
    },
    [gridRef],
  )

  const applyTool = useCallback(
    (x: number, y: number) => {
      const p = propsRef.current
      if (x < 0 || x >= p.cols || y < 0 || y >= p.rows) return
      const grid = gridRef.current
      switch (p.tool) {
        case 'brush':
          setCell(x, y, p.colorIdx)
          break
        case 'eraser':
          setCell(x, y, EMPTY)
          break
        case 'bucket': {
          if (floodFill(grid, p.cols, p.rows, x, y, p.colorIdx)) {
            const mx = p.mirror ? p.cols - 1 - x : -1
            if (mx >= 0) floodFill(grid, p.cols, p.rows, mx, y, p.colorIdx)
          }
          break
        }
        case 'picker': {
          const v = grid[y * p.cols + x]
          if (v >= 0) onPickColor(v)
          break
        }
        case 'hand':
          break
      }
    },
    [gridRef, setCell, onPickColor],
  )

  /* ---------- 指针交互 ---------- */
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size === 2) {
      /* 双指：取消绘制，进入捏合缩放 */
      drawingRef.current = false
      const pts = [...pointersRef.current.values()]
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const v = viewRef.current
      pinchRef.current = { d, midX: (pts[0].x + pts[1].x) / 2, midY: (pts[0].y + pts[1].y) / 2, zoom: v.zoom, panX: v.panX, panY: v.panY }
      return
    }
    if (pointersRef.current.size > 2) return

    const cell = eventToCell(e)

    /* 右键快速取色 */
    if (e.button === 2) {
      if (cell && cell.x >= 0 && cell.x < cols && cell.y >= 0 && cell.y < rows) {
        const v = gridRef.current[cell.y * cols + cell.x]
        if (v >= 0) onPickColor(v)
      }
      return
    }

    if (tool === 'hand' || spaceRef.current || e.button === 1) {
      const v = viewRef.current
      panningRef.current = { startX: e.clientX, startY: e.clientY, panX: v.panX, panY: v.panY }
      return
    }

    if (!cell) return
    if (tool === 'picker') {
      applyTool(cell.x, cell.y)
      return
    }
    onPaintStart()
    applyTool(cell.x, cell.y)
    onPaint()
    markDirty()
    if (tool === 'brush' || tool === 'eraser') {
      drawingRef.current = true
      lastCellRef.current = { x: cell.x, y: cell.y }
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const prev = pointersRef.current.get(e.pointerId)
    if (prev) pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    /* 捏合缩放 */
    if (pinchRef.current && pointersRef.current.size >= 2) {
      const pts = [...pointersRef.current.values()]
      const pinch = pinchRef.current
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const midX = (pts[0].x + pts[1].x) / 2
      const midY = (pts[0].y + pts[1].y) / 2
      const v = viewRef.current
      v.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pinch.zoom * (d / Math.max(1, pinch.d))))
      v.panX = pinch.panX + (midX - pinch.midX)
      v.panY = pinch.panY + (midY - pinch.midY)
      setZoomPct(Math.round(v.zoom * 100))
      markDirty()
      return
    }

    /* 平移 */
    if (panningRef.current) {
      const pan = panningRef.current
      viewRef.current.panX = pan.panX + (e.clientX - pan.startX)
      viewRef.current.panY = pan.panY + (e.clientY - pan.startY)
      markDirty()
      return
    }

    const cell = eventToCell(e)
    if (!cell) return
    const inBounds = cell.x >= 0 && cell.x < cols && cell.y >= 0 && cell.y < rows
    const newHover = inBounds ? { x: cell.x, y: cell.y } : null
    const oldHover = hoverRef.current
    if ((newHover?.x ?? -1) !== (oldHover?.x ?? -1) || (newHover?.y ?? -1) !== (oldHover?.y ?? -1)) {
      hoverRef.current = newHover
      setHoverCell(newHover)
      markDirty()
    }

    /* 拖拽连续绘制（Bresenham 补点） */
    if (drawingRef.current && inBounds) {
      const last = lastCellRef.current
      if (last && (last.x !== cell.x || last.y !== cell.y)) {
        for (const [lx, ly] of lineCells(last.x, last.y, cell.x, cell.y)) {
          applyTool(lx, ly)
        }
        lastCellRef.current = { x: cell.x, y: cell.y }
        onPaint()
        markDirty()
      }
    }
  }

  const endPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size < 2) pinchRef.current = null
    if (pointersRef.current.size === 0) {
      panningRef.current = null
      drawingRef.current = false
      lastCellRef.current = null
    }
  }

  /* 滚轮缩放（围绕光标） */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const v = viewRef.current
      const factor = Math.exp(-e.deltaY * 0.0016)
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.zoom * factor))
      if (next === v.zoom) return
      /* 以光标为锚点：记录光标所在格坐标，缩放后反解 pan 使其不动 */
      const lay = layout(rect.width, rect.height)
      const gx = (px - lay.ox) / lay.cs
      const gy = (py - lay.oy) / lay.cs
      v.zoom = next
      const lay2 = layout(rect.width, rect.height)
      const availW = rect.width - RULER - 12
      const availH = rect.height - RULER - 12
      v.panX = px - gx * lay2.cs - (RULER + (availW - propsRef.current.cols * lay2.cs) / 2)
      v.panY = py - gy * lay2.cs - (RULER + (availH - propsRef.current.rows * lay2.cs) / 2)
      setZoomPct(Math.round(next * 100))
      markDirty()
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [layout, markDirty])

  const cursor =
    tool === 'hand' || spaceHeld
      ? panningRef.current
        ? 'grabbing'
        : 'grab'
      : tool === 'eraser'
        ? ERASER_CURSOR
        : tool === 'picker'
          ? PICKER_CURSOR
          : 'crosshair'

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ touchAction: 'none', cursor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={() => {
          hoverRef.current = null
          setHoverCell(null)
          markDirty()
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* 左下角缩放指示 */}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-tag bg-bead-white/90 px-2.5 py-1 font-mono text-[11px] text-ash shadow-card">
        {zoomPct}%
      </div>
      {/* 右下角坐标指示 */}
      <div className="pointer-events-none absolute bottom-3 right-3 rounded-tag bg-bead-white/90 px-2.5 py-1 font-mono text-[11px] text-ash shadow-card">
        {hoverCell ? `(${String(hoverCell.x + 1).padStart(2, '0')}, ${String(hoverCell.y + 1).padStart(2, '0')})` : '( --, -- )'}
      </div>
      {overlayImg && (
        <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-grape/90 px-3 py-1 text-xs font-bold text-white shadow-card">
          模板描图中 · {Math.round(overlayOpacity * 100)}%
        </div>
      )}
    </div>
  )
}
