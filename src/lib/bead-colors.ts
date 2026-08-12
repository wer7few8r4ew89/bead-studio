/** 豆豆工坊 · 24 色真实拼豆材料调色盘（6 色系 × 4 色） */

export interface BeadFamily {
  key: string
  label: string
}

export const BEAD_FAMILIES: BeadFamily[] = [
  { key: 'R', label: '红色系' },
  { key: 'Y', label: '橙黄系' },
  { key: 'G', label: '绿色系' },
  { key: 'B', label: '蓝紫系' },
  { key: 'P', label: '粉棕系' },
  { key: 'N', label: '无彩色' },
]

export interface BeadColor {
  code: string
  name: string
  hex: string
  family: string
  custom?: boolean
}

export const BEAD_COLORS: BeadColor[] = [
  /* 红色系 */
  { code: 'R-01', name: '樱桃红', hex: '#E8452C', family: 'R' },
  { code: 'R-02', name: '蜜桃粉', hex: '#F2718C', family: 'R' },
  { code: 'R-03', name: '深绯红', hex: '#B02E1F', family: 'R' },
  { code: 'R-04', name: '珊瑚橘', hex: '#FF9D7E', family: 'R' },
  /* 橙黄系 */
  { code: 'Y-01', name: '蜜柑橙', hex: '#F08A1D', family: 'Y' },
  { code: 'Y-02', name: '明黄', hex: '#FFC93C', family: 'Y' },
  { code: 'Y-03', name: '奶油黄', hex: '#FFF3B0', family: 'Y' },
  { code: 'Y-04', name: '焦糖棕', hex: '#C97B12', family: 'Y' },
  /* 绿色系 */
  { code: 'G-01', name: '抹茶绿', hex: '#58A05C', family: 'G' },
  { code: 'G-02', name: '嫩芽绿', hex: '#9BCB3C', family: 'G' },
  { code: 'G-03', name: '深林绿', hex: '#2E7D4F', family: 'G' },
  { code: 'G-04', name: '青提绿', hex: '#C7E39B', family: 'G' },
  /* 蓝紫系 */
  { code: 'B-01', name: '天空蓝', hex: '#3E8EDE', family: 'B' },
  { code: 'B-02', name: '浅水蓝', hex: '#7FC4E8', family: 'B' },
  { code: 'B-03', name: '葡萄紫', hex: '#8B5FBF', family: 'B' },
  { code: 'B-04', name: '藏青蓝', hex: '#2C4E8A', family: 'B' },
  /* 粉棕系 */
  { code: 'P-01', name: '樱花粉', hex: '#F5A8C0', family: 'P' },
  { code: 'P-02', name: '可可棕', hex: '#A9714B', family: 'P' },
  { code: 'P-03', name: '深咖棕', hex: '#6B4530', family: 'P' },
  { code: 'P-04', name: '奶肤米', hex: '#FBD9C0', family: 'P' },
  /* 无彩色 */
  { code: 'N-01', name: '纯白', hex: '#FFFFFF', family: 'N' },
  { code: 'N-02', name: '米灰', hex: '#D8D2C8', family: 'N' },
  { code: 'N-03', name: '岩石灰', hex: '#8A8177', family: 'N' },
  { code: 'N-04', name: '墨黑', hex: '#2B2622', family: 'N' },
]

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const v = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase()
}

/** 相对亮度（0-1），用于决定其上文字用深/浅色 */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/** 在真实豆色中找最接近的颜色下标 */
export function nearestBeadIndex(r: number, g: number, b: number, palette: BeadColor[] = BEAD_COLORS): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < palette.length; i++) {
    const [pr, pg, pb] = hexToRgb(palette[i].hex)
    const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/** 图纸用色号短标：R-01 → R1 */
export function shortCode(code: string): string {
  return code.replace('-', '')
}

let customSeq = 1
export function makeCustomColor(hex: string): BeadColor {
  const code = `C-${String(customSeq++).padStart(2, '0')}`
  return { code, name: '自定义色', hex: hex.toUpperCase(), family: 'C', custom: true }
}

/** 恢复存档时保证自定义色号序号不回退 */
export function bumpCustomSeq(existing: BeadColor[]) {
  for (const c of existing) {
    const m = /^C-(\d+)$/.exec(c.code)
    if (m) customSeq = Math.max(customSeq, parseInt(m[1], 10) + 1)
  }
}
