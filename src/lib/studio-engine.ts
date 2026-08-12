/** 创作工坊编辑器核心逻辑：网格、填充、划线、存档、分享码、模板 */

import { BEAD_COLORS, bumpCustomSeq, nearestBeadIndex } from '@/lib/bead-colors'
import type { BeadColor } from '@/lib/bead-colors'

export type Tool = 'brush' | 'bucket' | 'picker' | 'eraser' | 'hand'

export const BOARD_SIZES = [
  { label: '21×21 小板', cols: 21, rows: 21 },
  { label: '29×29 标准板', cols: 29, rows: 29 },
  { label: '57×57 大板', cols: 57, rows: 57 },
] as const

export const EMPTY = -1

export interface TemplateDef {
  id: string
  name: string
  src: string
  cols: number
  rows: number
  category: string
}

export const TEMPLATE_CATEGORIES = ['全部', '动物', '植物', '食物', '游戏', '节日'] as const

export const TEMPLATES: TemplateDef[] = [
  { id: 'heart', name: '像素爱心', src: '/pattern-heart.png', cols: 29, rows: 29, category: '节日' },
  { id: 'shiba', name: '柴犬头像', src: '/pattern-shiba.png', cols: 29, rows: 29, category: '动物' },
  { id: 'cactus', name: '盆栽仙人掌', src: '/pattern-cactus.png', cols: 21, rows: 25, category: '植物' },
  { id: 'spaceship', name: '复古飞船', src: '/pattern-spaceship.png', cols: 25, rows: 25, category: '游戏' },
  { id: 'mushroom', name: '红蘑菇', src: '/pattern-mushroom.png', cols: 21, rows: 21, category: '游戏' },
  { id: 'cat', name: '黑猫剪影', src: '/pattern-cat.png', cols: 25, rows: 29, category: '动物' },
  { id: 'cherry', name: '一对樱桃', src: '/pattern-cherry.png', cols: 21, rows: 21, category: '食物' },
  { id: 'whale', name: '喷水小鲸', src: '/pattern-whale.png', cols: 25, rows: 21, category: '动物' },
]

export function createGrid(cols: number, rows: number): Int16Array {
  return new Int16Array(cols * rows).fill(EMPTY)
}

/** 调整画布尺寸，保留左上角重叠区域内容 */
export function resizeGrid(old: Int16Array, oldCols: number, oldRows: number, cols: number, rows: number): Int16Array {
  const next = createGrid(cols, rows)
  const w = Math.min(cols, oldCols)
  const h = Math.min(rows, oldRows)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) next[y * cols + x] = old[y * oldCols + x]
  }
  return next
}

/** 同色连通区域填充 */
export function floodFill(grid: Int16Array, cols: number, rows: number, x: number, y: number, value: number): boolean {
  const target = grid[y * cols + x]
  if (target === value) return false
  const stack: number[] = [y * cols + x]
  grid[y * cols + x] = value
  while (stack.length) {
    const i = stack.pop()!
    const cx = i % cols
    const cy = (i / cols) | 0
    if (cx > 0 && grid[i - 1] === target) { grid[i - 1] = value; stack.push(i - 1) }
    if (cx < cols - 1 && grid[i + 1] === target) { grid[i + 1] = value; stack.push(i + 1) }
    if (cy > 0 && grid[i - cols] === target) { grid[i - cols] = value; stack.push(i - cols) }
    if (cy < rows - 1 && grid[i + cols] === target) { grid[i + cols] = value; stack.push(i + cols) }
  }
  return true
}

/** Bresenham 直线经过的所有格子（拖拽连续绘制，避免跳跃断点） */
export function lineCells(x0: number, y0: number, x1: number, y1: number): Array<[number, number]> {
  const out: Array<[number, number]> = []
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  let x = x0
  let y = y0
  for (;;) {
    out.push([x, y])
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 > -dy) { err -= dy; x += sx }
    if (e2 < dx) { err += dx; y += sy }
  }
  return out
}

/** 用豆统计 */
export interface BeadStat {
  index: number
  count: number
  ratio: number
}

export function computeStats(grid: Int16Array): { stats: BeadStat[]; total: number; coverage: number } {
  const counts = new Map<number, number>()
  let total = 0
  for (let i = 0; i < grid.length; i++) {
    const v = grid[i]
    if (v >= 0) {
      counts.set(v, (counts.get(v) ?? 0) + 1)
      total++
    }
  }
  const stats: BeadStat[] = [...counts.entries()]
    .map(([index, count]) => ({ index, count, ratio: total ? count / total : 0 }))
    .sort((a, b) => b.count - a.count)
  return { stats, total, coverage: grid.length ? total / grid.length : 0 }
}

/* ---------------- 模板描图填充 ---------------- */

/**
 * 将模板图采样到 cols×rows，映射为最近真实豆色。
 * 浅色近白背景视为空位（模板均为白底板圆点背景）。
 */
export function imageToGrid(img: HTMLImageElement, cols: number, rows: number): Int16Array {
  const cv = document.createElement('canvas')
  cv.width = cols
  cv.height = rows
  const ctx = cv.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(img, 0, 0, cols, rows)
  const data = ctx.getImageData(0, 0, cols, rows).data
  const grid = createGrid(cols, rows)
  for (let i = 0; i < cols * rows; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    const a = data[i * 4 + 3]
    if (a < 40) continue
    /* 白底/浅灰底板 → 空位 */
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    if (lum > 0.9 && max - min < 28) continue
    grid[i] = nearestBeadIndex(r, g, b, BEAD_COLORS)
  }
  return grid
}

/* ---------------- 本地存档 ---------------- */

const SAVE_KEY = 'beadstudio.work.v1'

export interface WorkSave {
  name: string
  cols: number
  rows: number
  grid: number[]
  customs: BeadColor[]
  createdAt: number
  savedAt: number
  editMs: number
}

export function saveWork(w: WorkSave) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(w))
  } catch {
    /* 存储满等异常静默 */
  }
}

export function loadWork(): WorkSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const w = JSON.parse(raw) as WorkSave
    if (!w || !Array.isArray(w.grid) || !w.cols || !w.rows) return null
    if (w.grid.length !== w.cols * w.rows) return null
    bumpCustomSeq(w.customs ?? [])
    return w
  } catch {
    return null
  }
}

export function hasSavedWork(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) != null
  } catch {
    return false
  }
}

/* ---------------- 分享链接编码 ---------------- */

function rleEncode(grid: Int16Array): string {
  const parts: string[] = []
  let i = 0
  while (i < grid.length) {
    const v = grid[i]
    let run = 1
    while (i + run < grid.length && grid[i + run] === v) run++
    parts.push(run > 1 ? `${v}x${run}` : `${v}`)
    i += run
  }
  return parts.join(',')
}

function rleDecode(s: string, len: number): Int16Array | null {
  const grid = new Int16Array(len).fill(EMPTY)
  let i = 0
  for (const part of s.split(',')) {
    if (!part) continue
    const m = /^(-?\d+)(?:x(\d+))?$/.exec(part)
    if (!m) return null
    const v = parseInt(m[1], 10)
    const run = m[2] ? parseInt(m[2], 10) : 1
    for (let k = 0; k < run && i < len; k++) grid[i++] = v
  }
  return i === len ? grid : null
}

export function encodeShare(name: string, cols: number, rows: number, grid: Int16Array, customs: BeadColor[]): string {
  const payload = {
    v: 1,
    n: name,
    c: cols,
    r: rows,
    g: rleEncode(grid),
    cu: customs.map((c) => [c.code, c.name, c.hex]),
  }
  const json = JSON.stringify(payload)
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeShare(token: string): { name: string; cols: number; rows: number; grid: Int16Array; customs: BeadColor[] } | null {
  try {
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b64)))
    const p = JSON.parse(json)
    if (p?.v !== 1 || !p.c || !p.r) return null
    const grid = rleDecode(String(p.g), p.c * p.r)
    if (!grid) return null
    const customs: BeadColor[] = Array.isArray(p.cu)
      ? p.cu.map(([code, name, hex]: [string, string, string]) => ({ code, name, hex, family: 'C', custom: true }))
      : []
    bumpCustomSeq(customs)
    return { name: String(p.n ?? '分享作品'), cols: p.c, rows: p.r, grid, customs }
  } catch {
    return null
  }
}
