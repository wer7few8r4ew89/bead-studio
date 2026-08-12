/**
 * 豆色材料库数据 —— 24 色拼豆完整档案（6 色系家族 × 4 色）。
 * 色值与 design.md 第 2 节「豆子调色盘」完全一致。
 */

export interface BeadColor {
  /** 豆号，如 R-01 */
  id: string
  /** 色名，如 樱桃红 */
  name: string
  hex: string
  /** 用量热度 1-5 */
  heat: number
  /** 家族 id */
  family: FamilyId
  /** 常用搭配（2 颗豆号） */
  pairings: [string, string]
}

export type FamilyId = 'red' | 'orange' | 'green' | 'blue' | 'pink' | 'neutral'

export interface Family {
  id: FamilyId
  zh: string
  en: string
  desc: string
  /** 家族代表色（用于点缀） */
  accent: string
}

export const FAMILIES: Family[] = [
  { id: 'red', zh: '红色系', en: 'REDS', desc: '热烈担当，勾勒轮廓的首选', accent: '#E8452C' },
  { id: 'orange', zh: '橙黄系', en: 'YELLOWS', desc: '阳光本光，点亮整幅画面', accent: '#F08A1D' },
  { id: 'green', zh: '绿色系', en: 'GREENS', desc: '清新治愈，植物系的主角', accent: '#58A05C' },
  { id: 'blue', zh: '蓝紫系', en: 'BLUES', desc: '冷色梦幻，星空与大海', accent: '#3E8EDE' },
  { id: 'pink', zh: '粉棕系', en: 'BROWNS', desc: '温柔底色，皮肤与甜点', accent: '#A9714B' },
  { id: 'neutral', zh: '无彩色', en: 'NEUTRALS', desc: '百搭骨架，轮廓与留白', accent: '#8A8177' },
]

export const BEADS: BeadColor[] = [
  /* 红色系 */
  { id: 'R-01', name: '樱桃红', hex: '#E8452C', heat: 5, family: 'red', pairings: ['W-01', 'K-00'] },
  { id: 'R-02', name: '蜜桃粉', hex: '#F2718C', heat: 4, family: 'red', pairings: ['K-01', 'W-01'] },
  { id: 'R-03', name: '砖红', hex: '#B02E1F', heat: 3, family: 'red', pairings: ['N-01', 'O-02'] },
  { id: 'R-04', name: '珊瑚橘粉', hex: '#FF9D7E', heat: 3, family: 'red', pairings: ['Y-02', 'B-02'] },
  /* 橙黄系 */
  { id: 'O-01', name: '南瓜橙', hex: '#F08A1D', heat: 4, family: 'orange', pairings: ['K-02', 'K-00'] },
  { id: 'Y-01', name: '明黄', hex: '#FFC93C', heat: 5, family: 'orange', pairings: ['B-01', 'K-00'] },
  { id: 'Y-02', name: '奶油黄', hex: '#FFF3B0', heat: 3, family: 'orange', pairings: ['G-01', 'N-01'] },
  { id: 'O-02', name: '焦糖', hex: '#C97B12', heat: 2, family: 'orange', pairings: ['N-02', 'R-03'] },
  /* 绿色系 */
  { id: 'G-01', name: '抹茶绿', hex: '#58A05C', heat: 5, family: 'green', pairings: ['N-01', 'W-01'] },
  { id: 'G-02', name: '嫩芽绿', hex: '#9BCB3C', heat: 3, family: 'green', pairings: ['Y-02', 'G-03'] },
  { id: 'G-03', name: '深林绿', hex: '#2E7D4F', heat: 3, family: 'green', pairings: ['G-04', 'N-02'] },
  { id: 'G-04', name: '薄荷霜', hex: '#C7E39B', heat: 2, family: 'green', pairings: ['B-02', 'W-01'] },
  /* 蓝紫系 */
  { id: 'B-01', name: '天空蓝', hex: '#3E8EDE', heat: 5, family: 'blue', pairings: ['W-01', 'Y-01'] },
  { id: 'B-02', name: '婴儿蓝', hex: '#7FC4E8', heat: 3, family: 'blue', pairings: ['P-01', 'W-01'] },
  { id: 'P-01', name: '葡萄紫', hex: '#8B5FBF', heat: 4, family: 'blue', pairings: ['B-02', 'A-01'] },
  { id: 'B-03', name: '午夜蓝', hex: '#2C4E8A', heat: 3, family: 'blue', pairings: ['Y-01', 'A-01'] },
  /* 粉棕系 */
  { id: 'K-01', name: '樱花粉', hex: '#F5A8C0', heat: 4, family: 'pink', pairings: ['W-01', 'R-02'] },
  { id: 'N-01', name: '可可棕', hex: '#A9714B', heat: 4, family: 'pink', pairings: ['G-01', 'K-02'] },
  { id: 'N-02', name: '深咖', hex: '#6B4530', heat: 3, family: 'pink', pairings: ['O-02', 'Y-02'] },
  { id: 'K-02', name: '杏子奶油', hex: '#FBD9C0', heat: 3, family: 'pink', pairings: ['O-01', 'R-04'] },
  /* 无彩色 */
  { id: 'W-01', name: '纯白', hex: '#FFFFFF', heat: 5, family: 'neutral', pairings: ['K-00', 'R-01'] },
  { id: 'A-01', name: '浅灰', hex: '#D8D2C8', heat: 3, family: 'neutral', pairings: ['W-01', 'B-01'] },
  { id: 'A-02', name: '岩石灰', hex: '#8A8177', heat: 2, family: 'neutral', pairings: ['K-00', 'A-01'] },
  { id: 'K-00', name: '暖黑', hex: '#2B2622', heat: 5, family: 'neutral', pairings: ['W-01', 'Y-01'] },
]

const BEAD_MAP = new Map(BEADS.map((b) => [b.id, b]))

export function getBead(id: string): BeadColor {
  const b = BEAD_MAP.get(id)
  if (!b) throw new Error(`未知豆号: ${id}`)
  return b
}

export function beadsByFamily(family: FamilyId): BeadColor[] {
  return BEADS.filter((b) => b.family === family)
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** 黄金搭档：三色组合（详情弹层按包含关系推荐） */
export interface Combo {
  name: string
  ids: [string, string, string]
}

export const COMBOS: Combo[] = [
  { name: '经典轮廓', ids: ['R-01', 'W-01', 'K-00'] },
  { name: '草莓牛奶', ids: ['R-02', 'K-01', 'W-01'] },
  { name: '落日飞车', ids: ['O-01', 'Y-01', 'R-04'] },
  { name: '蜂蜜奶油', ids: ['Y-01', 'Y-02', 'O-02'] },
  { name: '抹茶拿铁', ids: ['G-01', 'K-02', 'W-01'] },
  { name: '森林深处', ids: ['G-03', 'G-02', 'N-01'] },
  { name: '晴空白云', ids: ['B-01', 'W-01', 'B-02'] },
  { name: '星空夜幕', ids: ['B-03', 'P-01', 'Y-01'] },
  { name: '葡萄气泡', ids: ['P-01', 'B-02', 'A-01'] },
  { name: '可可曲奇', ids: ['N-01', 'N-02', 'K-02'] },
  { name: '水泥森林', ids: ['A-02', 'A-01', 'K-00'] },
  { name: '樱桃苏打', ids: ['R-01', 'B-02', 'W-01'] },
]

export function combosFor(beadId: string): Combo[] {
  return COMBOS.filter((c) => c.ids.includes(beadId)).slice(0, 3)
}

/** 懒人配色包：整套配色方案 */
export interface PalettePack {
  id: string
  name: string
  scene: string
  ids: [string, string, string, string, string]
  /** 代表图案缩略图 */
  patternImg: string
}

export const PALETTE_PACKS: PalettePack[] = [
  {
    id: 'strawberry-milk',
    name: '草莓牛奶',
    scene: '甜品、可爱系',
    ids: ['R-01', 'R-02', 'K-01', 'W-01', 'A-01'],
    patternImg: '/pattern-cherry.png',
  },
  {
    id: 'retro-arcade',
    name: '复古街机',
    scene: '游戏像素风',
    ids: ['K-00', 'Y-01', 'B-01', 'R-01', 'W-01'],
    patternImg: '/pattern-spaceship.png',
  },
  {
    id: 'forest-noon',
    name: '森林午后',
    scene: '植物动物系',
    ids: ['G-03', 'G-01', 'G-02', 'N-01', 'Y-02'],
    patternImg: '/pattern-cactus.png',
  },
  {
    id: 'sea-salt-grape',
    name: '海盐葡萄',
    scene: '冷色梦幻系',
    ids: ['P-01', 'B-02', 'B-01', 'W-01', 'A-01'],
    patternImg: '/pattern-whale.png',
  },
]
