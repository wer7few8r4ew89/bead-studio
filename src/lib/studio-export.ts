/** 图纸导出：带坐标、色号标注与用豆清单的 PNG 画布渲染 */

import { luminance, shortCode } from '@/lib/bead-colors'
import type { BeadColor } from '@/lib/bead-colors'
import { computeStats } from '@/lib/studio-engine'

/** 绘制一颗拟物豆子（圆角方块 + 顶部高光 + 内描边） */
export function drawBead(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hex: string) {
  const r = Math.max(1.5, size * 0.14)
  const pad = Math.max(0.5, size * 0.04)
  const s = size - pad * 2
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x + pad, y + pad, s, s, r)
  ctx.fillStyle = hex
  ctx.fill()
  /* 顶部高光 */
  const grad = ctx.createLinearGradient(0, y + pad, 0, y + pad + s * 0.34)
  grad.addColorStop(0, 'rgba(255,255,255,0.4)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fill()
  /* 内描边 */
  ctx.strokeStyle = 'rgba(43,38,34,0.22)'
  ctx.lineWidth = Math.max(0.6, size * 0.03)
  ctx.stroke()
  ctx.restore()
}

export interface BlueprintOptions {
  name: string
  cols: number
  rows: number
  grid: Int16Array
  palette: BeadColor[]
  boardWhite: boolean
  cell?: number
}

/** 生成图纸 canvas：坐标网格 + 每格色号 + 底部用豆清单 */
export function renderBlueprint({ name, cols, rows, grid, palette, boardWhite, cell = 28 }: BlueprintOptions): HTMLCanvasElement {
  const ruler = 34
  const headerH = 56
  const { stats, total } = computeStats(grid)
  const listCols = Math.max(1, Math.min(4, Math.ceil(stats.length / 4)))
  const listRows = Math.ceil(Math.max(stats.length, 1) / listCols)
  const listH = stats.length ? 44 + listRows * 30 + 16 : 0
  const footerH = 34
  const w = ruler + cols * cell + 20
  const h = headerH + ruler + rows * cell + 20 + listH + footerH

  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')!

  /* 背景 */
  ctx.fillStyle = boardWhite ? '#FFFFFF' : '#FBF6EE'
  ctx.fillRect(0, 0, w, h)

  const ox = ruler
  const oy = headerH + ruler

  /* 标题 */
  ctx.fillStyle = '#2B2622'
  ctx.font = '700 18px "Noto Sans SC", sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${name || '未命名作品'} · ${cols}×${rows}`, ruler, headerH / 2 - 6)
  ctx.font = '500 11px "DM Mono", monospace'
  ctx.fillStyle = '#8A8177'
  ctx.fillText(`BEAD STUDIO · TOTAL ${total} BEADS`, ruler, headerH / 2 + 14)

  /* 透明底板 → 棋盘格 */
  if (!boardWhite) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(ox, oy, cols * cell, rows * cell)
    ctx.clip()
    const s = cell / 2
    for (let y = 0; y < rows * 2; y++) {
      for (let x = 0; x < cols * 2; x++) {
        if ((x + y) % 2 === 0) continue
        ctx.fillStyle = '#F0EAE0'
        ctx.fillRect(ox + x * s, oy + y * s, s, s)
      }
    }
    ctx.restore()
  }

  /* 豆子与色号 */
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = grid[y * cols + x]
      const px = ox + x * cell
      const py = oy + y * cell
      if (v >= 0 && palette[v]) {
        drawBead(ctx, px, py, cell, palette[v].hex)
        ctx.fillStyle = luminance(palette[v].hex) > 0.62 ? 'rgba(43,38,34,0.72)' : 'rgba(255,255,255,0.85)'
        ctx.font = `500 ${Math.max(7, cell * 0.28)}px "DM Mono", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(shortCode(palette[v].code), px + cell / 2, py + cell / 2 + 0.5)
        ctx.textAlign = 'left'
      } else {
        ctx.fillStyle = 'rgba(43,38,34,0.10)'
        ctx.beginPath()
        ctx.arc(px + cell / 2, py + cell / 2, Math.max(1, cell * 0.07), 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  /* 网格线 */
  ctx.strokeStyle = '#E5DCCB'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= cols; x++) {
    ctx.moveTo(ox + x * cell + 0.5, oy)
    ctx.lineTo(ox + x * cell + 0.5, oy + rows * cell)
  }
  for (let y = 0; y <= rows; y++) {
    ctx.moveTo(ox, oy + y * cell + 0.5)
    ctx.lineTo(ox + cols * cell, oy + y * cell + 0.5)
  }
  ctx.stroke()

  /* 坐标刻度 */
  ctx.fillStyle = '#8A8177'
  ctx.font = '500 9px "DM Mono", monospace'
  ctx.textBaseline = 'middle'
  for (let x = 0; x < cols; x += 5) {
    ctx.textAlign = 'center'
    ctx.fillText(String(x + 1), ox + x * cell + cell / 2, oy - 14)
  }
  for (let y = 0; y < rows; y += 5) {
    ctx.textAlign = 'right'
    ctx.fillText(String(y + 1), ox - 8, oy + y * cell + cell / 2)
  }
  ctx.textAlign = 'left'

  /* 用豆清单 */
  if (stats.length) {
    const ly = oy + rows * cell + 26
    ctx.fillStyle = '#2B2622'
    ctx.font = '700 13px "Noto Sans SC", sans-serif'
    ctx.fillText(`用豆清单 · 共 ${total} 颗 / ${stats.length} 色`, ruler, ly)
    const colW = (w - ruler - 20) / listCols
    stats.forEach((st, i) => {
      const c = palette[st.index]
      if (!c) return
      const cx = ruler + (i % listCols) * colW
      const cy = ly + 24 + Math.floor(i / listCols) * 30
      drawBead(ctx, cx, cy - 9, 18, c.hex)
      ctx.fillStyle = '#2B2622'
      ctx.font = '500 11px "DM Mono", monospace'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${c.code}`, cx + 26, cy - 5)
      ctx.fillStyle = '#8A8177'
      ctx.font = '400 11px "Noto Sans SC", sans-serif'
      ctx.fillText(`${c.name} ×${st.count}`, cx + 26, cy + 9)
    })
  }

  /* 页脚 */
  ctx.fillStyle = '#8A8177'
  ctx.font = '500 9px "DM Mono", monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('MADE WITH BEAD STUDIO · ONE BEAD AT A TIME', w - 16, h - footerH / 2)
  ctx.textAlign = 'left'

  return cv
}

/** 复制用文本清单 */
export function buildListText(name: string, cols: number, rows: number, grid: Int16Array, palette: BeadColor[]): string {
  const { stats, total } = computeStats(grid)
  const lines = stats.map((st) => {
    const c = palette[st.index]
    return c ? `${c.code} ${c.name}（${c.hex}）× ${st.count}` : ''
  })
  return [`《${name || '未命名作品'}》 ${cols}×${rows} · 共 ${total} 颗 / ${stats.length} 色`, ...lines].join('\n')
}

/** 触发浏览器下载 PNG */
export function downloadCanvasPng(cv: HTMLCanvasElement, filename: string) {
  const a = document.createElement('a')
  a.href = cv.toDataURL('image/png')
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** PDF 打印版：新窗口展示图纸并调起系统打印（可另存为 PDF） */
export function printBlueprint(cv: HTMLCanvasElement, title: string) {
  const win = window.open('', '_blank')
  if (!win) return false
  const url = cv.toDataURL('image/png')
  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>` +
      `<style>body{margin:0;display:flex;justify-content:center;background:#FBF6EE}img{max-width:100%;height:auto}@media print{body{background:#fff}}</style>` +
      `</head><body><img src="${url}" onload="setTimeout(()=>window.print(),200)"></body></html>`,
  )
  win.document.close()
  return true
}
