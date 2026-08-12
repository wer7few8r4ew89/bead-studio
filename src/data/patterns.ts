/**
 * 图案库数据 —— 8 张生成的图案设计稿（public/pattern-*.png）
 * + 18 个像素数据定义的图案（grid 字符画，palette 映射到 24 色豆号）。
 */

export type CategoryId = 'animal' | 'plant' | 'food' | 'game' | 'festival' | 'symbol'

export const CATEGORIES: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'animal', label: '动物' },
  { id: 'plant', label: '植物' },
  { id: 'food', label: '食物' },
  { id: 'game', label: '游戏像素' },
  { id: 'festival', label: '节日' },
  { id: 'symbol', label: '字母符号' },
]

export type SizeBucket = 'small' | 'standard' | 'large'

export const SIZE_LABEL: Record<SizeBucket, string> = {
  small: '小板 21×21',
  standard: '标准 29×29',
  large: '大板 57×57',
}

export interface PatternColor {
  beadId: string
  count: number
}

export interface BeadPattern {
  id: string
  name: string
  category: CategoryId
  difficulty: 1 | 2 | 3 | 4 | 5
  width: number
  height: number
  /** 总豆数 */
  beads: number
  /** 受欢迎度（排序用） */
  popularity: number
  /** 上架日期（排序用） */
  createdAt: string
  author: string
  /** 生成图稿（与 grid 二选一） */
  image?: string
  /** 像素字符画 */
  grid?: string[]
  /** 字符 → 豆号 */
  palette?: Record<string, string>
  colors: PatternColor[]
  tip: string
}

export function sizeBucket(p: Pick<BeadPattern, 'width' | 'height'>): SizeBucket {
  const m = Math.max(p.width, p.height)
  if (m <= 21) return 'small'
  if (m <= 29) return 'standard'
  return 'large'
}

/* ---------- 像素字符画工具 ---------- */

function gridStats(grid: string[], palette: Record<string, string>) {
  const counts = new Map<string, number>()
  let beads = 0
  let width = 0
  for (const row of grid) {
    width = Math.max(width, row.length)
    for (const ch of row) {
      const id = palette[ch]
      if (id) {
        counts.set(id, (counts.get(id) ?? 0) + 1)
        beads++
      }
    }
  }
  const colors = [...counts.entries()]
    .map(([beadId, count]) => ({ beadId, count }))
    .sort((a, b) => b.count - a.count)
  return { width, height: grid.length, beads, colors }
}

interface PixelDef {
  id: string
  name: string
  category: CategoryId
  difficulty: 1 | 2 | 3 | 4 | 5
  popularity: number
  createdAt: string
  author?: string
  grid: string[]
  palette: Record<string, string>
  tip: string
}

function pixel(def: PixelDef): BeadPattern {
  const { width, height, beads, colors } = gridStats(def.grid, def.palette)
  return {
    id: def.id,
    name: def.name,
    category: def.category,
    difficulty: def.difficulty,
    popularity: def.popularity,
    createdAt: def.createdAt,
    author: def.author ?? '豆豆工坊',
    width,
    height,
    beads,
    grid: def.grid,
    palette: def.palette,
    colors,
    tip: def.tip,
  }
}

/* ---------- 手工像素图案 ---------- */

const PIXEL_PATTERNS: BeadPattern[] = [
  pixel({
    id: 'paw',
    name: '小猫爪',
    category: 'animal',
    difficulty: 1,
    popularity: 88,
    createdAt: '2025-03-02',
    grid: [
      '..##....##..',
      '.#PP#..#PP#.',
      '.#PP#..#PP#.',
      '..##....##..',
      '............',
      '...######...',
      '..#PPPPPP#..',
      '..#PPPPPP#..',
      '..#PPPPPP#..',
      '...######...',
    ],
    palette: { '#': 'K-00', P: 'K-01' },
    tip: '先拼四颗小肉垫定位，再拼大掌垫，不容易跑偏。',
  }),
  pixel({
    id: 'fish',
    name: '泡泡小鱼',
    category: 'animal',
    difficulty: 2,
    popularity: 64,
    createdAt: '2025-04-18',
    grid: [
      '......oooo........',
      '....oooooooooo....',
      '..ooooooooooooo...',
      '.oEoooooooooooo...',
      'oooooooooooooo.tt.',
      '.oooooooooooo..ttt',
      '..oooooooooo..ttt.',
      '....oooooooo.tt...',
      '......oo...tt.....',
    ],
    palette: { o: 'O-01', E: 'K-00', t: 'O-02' },
    tip: '鱼眼只有一颗暖黑，位置决定整条鱼的神态。',
  }),
  pixel({
    id: 'tulip',
    name: '郁金香',
    category: 'plant',
    difficulty: 1,
    popularity: 72,
    createdAt: '2025-02-14',
    grid: [
      '..p...p..',
      '..pp.pp..',
      '..ppppp..',
      '..ppppp..',
      '..ppppp..',
      '...ppp...',
      '....g....',
      '.gg.g.gg.',
      '.ggg.ggg.',
      '..g..g...',
      '..g..g...',
      '..gggg...',
    ],
    palette: { p: 'R-02', g: 'G-01' },
    tip: '花瓣可以换成任意红色系豆子，一束拼三种颜色更好看。',
  }),
  pixel({
    id: 'tree',
    name: '小松树',
    category: 'plant',
    difficulty: 1,
    popularity: 58,
    createdAt: '2025-05-01',
    grid: [
      '......g......',
      '.....ggg.....',
      '....ggggg....',
      '...ggggggg...',
      '.....ggg.....',
      '....ggggg....',
      '...ggggggg...',
      '..ggggggggg..',
      '.ggggggggggg.',
      '.....ttt.....',
      '.....ttt.....',
      '.....ttt.....',
    ],
    palette: { g: 'G-03', t: 'N-01' },
    tip: '三层树冠从中间往两边拼，保持对称。',
  }),
  pixel({
    id: 'watermelon',
    name: '西瓜切片',
    category: 'food',
    difficulty: 2,
    popularity: 91,
    createdAt: '2025-06-20',
    grid: [
      'ggggggggggggggggg',
      'wwwwwwwwwwwwwwwww',
      'wrrrsrrrrrsrrrrrw',
      '.wrrrrrsrrrrrrw..',
      '.wrsrrrrrrrsrrw..',
      '..wrrrrsrrrrrw...',
      '..wrrsrrrrrsrw...',
      '...wrrrrrrrw.....',
      '....wrrsrw.......',
      '.....wrrw........',
      '......ww.........',
    ],
    palette: { g: 'G-01', w: 'W-01', r: 'R-01', s: 'K-00' },
    tip: '瓜子（暖黑）随意散落更自然，不必严格对称。',
  }),
  pixel({
    id: 'icecream',
    name: '樱花甜筒',
    category: 'food',
    difficulty: 2,
    popularity: 85,
    createdAt: '2025-06-01',
    grid: [
      '.....kkk.....',
      '...kkkkkkk...',
      '..kkkkkkkkk..',
      '.kkwkkkkwkkk.',
      '.kkkkkkkkkkk.',
      '..kkkkkkkkk..',
      '...kkkkkkk...',
      '....ccccc....',
      '....c.c.c....',
      '.....ccc.....',
      '.....c.c.....',
      '......c......',
    ],
    palette: { k: 'K-01', w: 'W-01', c: 'N-01' },
    tip: '甜筒格子纹用隔颗留白表现，烫完更清晰。',
  }),
  pixel({
    id: 'rocket',
    name: '冲天火箭',
    category: 'game',
    difficulty: 3,
    popularity: 77,
    createdAt: '2025-07-11',
    grid: [
      '......rrr......',
      '.....rrrrr.....',
      '.....rrrrr.....',
      '....sssssss....',
      '...sssssssss...',
      '...sswwwssss...',
      '...sswwwssss...',
      '...sssssssss...',
      '...sssssssss...',
      '..sssssssssss..',
      '.rrsssssssssrr.',
      '.rrsssssssssrr.',
      'rrrsssssssssrrr',
      '....yyyyy......',
      '.....yyy.......',
      '......y........',
    ],
    palette: { r: 'R-01', s: 'A-01', w: 'B-01', y: 'Y-01' },
    tip: '尾焰可以再加一圈 O-01 渐变，喷射感更强。',
  }),
  pixel({
    id: 'ghost',
    name: '小幽灵',
    category: 'game',
    difficulty: 2,
    popularity: 95,
    createdAt: '2025-08-08',
    grid: [
      '....ppppp....',
      '..ppppppppp..',
      '.ppppppppppp.',
      '.ppwwpppwwpp.',
      '.ppwwpppwwpp.',
      '.ppppppppppp.',
      '.ppppppppppp.',
      'ppppppppppppp',
      'ppppppppppppp',
      'ppppppppppppp',
      'pp.pp.pp.pp.p',
    ],
    palette: { p: 'P-01', w: 'W-01' },
    tip: '波浪下摆是灵魂，烫前确认每颗都卡进凹槽。',
  }),
  pixel({
    id: 'coin',
    name: '金币',
    category: 'game',
    difficulty: 1,
    popularity: 70,
    createdAt: '2025-03-15',
    grid: [
      '...yyyyy...',
      '..yyyyyyy..',
      '.yywwyyyyy.',
      '.yywyyyyyy.',
      'yyyyyyyyyyy',
      'yyyyyyyyyyy',
      'yyyyyyyyyyy',
      '.yyyyyyyys.',
      '.yyyyyyssy.',
      '..yyyyyyy..',
      '...yyyyy...',
    ],
    palette: { y: 'Y-01', w: 'Y-02', s: 'O-02' },
    tip: '左上高光、右下阴影，是金币立体感的关键。',
  }),
  pixel({
    id: 'snowflake',
    name: '雪花',
    category: 'festival',
    difficulty: 2,
    popularity: 66,
    createdAt: '2025-01-05',
    grid: [
      'b.....b.....b',
      '.b...b.b...b.',
      '..b..b.b..b..',
      '...b.b.b.b...',
      '....b.b.b....',
      'bbbbbb.bbbbbb',
      '....b.b.b....',
      '...b.b.b.b...',
      '..b..b.b..b..',
      '.b...b.b...b.',
      'b.....b.....b',
    ],
    palette: { b: 'B-02' },
    tip: '单色图案建议用镊子逐枝拼，六枝完全对称。',
  }),
  pixel({
    id: 'gift',
    name: '礼物盒',
    category: 'festival',
    difficulty: 1,
    popularity: 74,
    createdAt: '2025-01-20',
    grid: [
      '...kk...kk...',
      '..k..k.k..k..',
      '...kkk.kkk...',
      '....kkkkk....',
      '#############',
      '#yyyyykyyyyy#',
      '#yyyyykyyyyy#',
      '#yyyyykyyyyy#',
      '#yyyyykyyyyy#',
      '#############',
    ],
    palette: { k: 'R-01', '#': 'N-01', y: 'Y-01' },
    tip: '蝴蝶结曲线多，先用 R-03 描影再填 R-01 更立体。',
  }),
  pixel({
    id: 'letter-a',
    name: '像素字母 A',
    category: 'symbol',
    difficulty: 1,
    popularity: 52,
    createdAt: '2025-02-01',
    grid: [
      '....###....',
      '...##.##...',
      '..##...##..',
      '.##.....##.',
      '##.......##',
      '###########',
      '##.......##',
      '##.......##',
      '##.......##',
      '##.......##',
    ],
    palette: { '#': 'R-01' },
    tip: '字母系列可拼名字首字母做钥匙扣。',
  }),
  pixel({
    id: 'arrow',
    name: '前进箭头',
    category: 'symbol',
    difficulty: 1,
    popularity: 40,
    createdAt: '2025-05-20',
    grid: [
      '......##......',
      '......###.....',
      '......####....',
      '###########...',
      '############..',
      '###########...',
      '......####....',
      '......###.....',
      '......##......',
    ],
    palette: { '#': 'B-01' },
    tip: '适合做指示牌挂件，可镜像拼一对。',
  }),
  pixel({
    id: 'note',
    name: '八分音符',
    category: 'symbol',
    difficulty: 1,
    popularity: 61,
    createdAt: '2025-04-02',
    grid: [
      '....#####.',
      '....#...#.',
      '....#...#.',
      '....#...#.',
      '....#...#.',
      '....#...#.',
      '....#...#.',
      '..###...#.',
      '.#####..#.',
      '.#####.##.',
      '..###.....',
    ],
    palette: { '#': 'P-01' },
    tip: '音符头椭圆先拼外圈再填芯。',
  }),
  pixel({
    id: 'crown',
    name: '小皇冠',
    category: 'symbol',
    difficulty: 2,
    popularity: 69,
    createdAt: '2025-07-30',
    grid: [
      'k.....k.k.....k',
      'kk...kk.kk...kk',
      'k.kk.kk.kk.kk.k',
      'kkkkkkkrkkkkkkk',
      'kkrkkkrrrkkkrkk',
      '.kkkkkkkkkkkkk.',
      '..kkkkkkkkkkk..',
    ],
    palette: { k: 'Y-01', r: 'R-01' },
    tip: '宝石用蜜桃粉也很公主风。',
  }),
]

/* ---------- 程序化生成的大板图案 ---------- */

/** 彩虹（39×22，大板） */
function rainbowGrid(): { grid: string[]; palette: Record<string, string> } {
  const W = 41
  const H = 22
  const bands: [number, string][] = [
    [20, 'r'], [18, 'o'], [16, 'y'], [14, 'g'], [12, 'b'], [10, 'p'],
  ]
  const grid: string[] = []
  for (let y = 0; y < H; y++) {
    let row = ''
    for (let x = 0; x < W; x++) {
      const dx = x - 20
      const dy = 21 - y
      const d = Math.sqrt(dx * dx + dy * dy)
      let ch = '.'
      if (dy >= 0) {
        for (const [r, c] of bands) {
          if (d <= r && d > r - 2) {
            ch = c
            break
          }
        }
      }
      row += ch
    }
    grid.push(row)
  }
  return {
    grid,
    palette: { r: 'R-01', o: 'O-01', y: 'Y-01', g: 'G-01', b: 'B-01', p: 'P-01' },
  }
}

/** 大爱心（45×41，大板，心形隐函数） */
function bigHeartGrid(): { grid: string[]; palette: Record<string, string> } {
  const W = 45
  const H = 41
  const grid: string[] = []
  for (let y = 0; y < H; y++) {
    let row = ''
    for (let x = 0; x < W; x++) {
      const X = (x - 22) / 20
      const Y = -(y - 20) / 18
      const f = (X * X + Y * Y - 1) ** 3 - X * X * Y * Y * Y
      let ch = '.'
      if (f <= 0) {
        ch = X < -0.35 && Y > 0.35 ? 'h' : 'r'
      }
      row += ch
    }
    grid.push(row)
  }
  return { grid, palette: { r: 'R-01', h: 'R-02' } }
}

/** 日落大道（33×33，大板） */
function sunsetGrid(): { grid: string[]; palette: Record<string, string> } {
  const W = 33
  const H = 33
  const sky: [number, string][] = [
    [6, 'p'], [12, 'r'], [18, 'o'], [24, 'y'], [27, 'c'],
  ]
  const grid: string[] = []
  for (let y = 0; y < H; y++) {
    let row = ''
    for (let x = 0; x < W; x++) {
      let ch = 'k'
      if (y < 27) {
        ch = sky.find(([limit]) => y < limit)?.[1] ?? 'c'
        /* 太阳 */
        const dx = x - 16
        const dy = y - 19
        if (dx * dx + dy * dy <= 36) ch = 's'
        /* 飞鸟 */
        if ((y === 7 && (x === 8 || x === 10)) || (y === 8 && x === 9)) ch = 'k'
        if ((y === 9 && (x === 23 || x === 25)) || (y === 10 && x === 24)) ch = 'k'
      } else {
        /* 地面道路中线 */
        ch = y >= 30 && x >= 15 && x <= 17 ? 'c' : 'k'
      }
      row += ch
    }
    grid.push(row)
  }
  return {
    grid,
    palette: { p: 'P-01', r: 'R-04', o: 'O-01', y: 'Y-01', c: 'Y-02', s: 'Y-01', k: 'K-00' },
  }
}

/** 海浪波纹（25×21，标准板） */
function waveGrid(): { grid: string[]; palette: Record<string, string> } {
  const W = 25
  const H = 21
  const grid: string[] = []
  for (let y = 0; y < H; y++) {
    let row = ''
    for (let x = 0; x < W; x++) {
      const edge = 7 + Math.round(3.2 * Math.sin(x / 2.6))
      let ch = '.'
      if (y >= edge) {
        const band = Math.floor((y - edge) / 3)
        ch = band % 2 === 0 ? 'd' : 'l'
        if (y === edge && Math.sin(x / 2.6) > 0.55) ch = 'w'
      }
      row += ch
    }
    grid.push(row)
  }
  return { grid, palette: { d: 'B-01', l: 'B-02', w: 'W-01' } }
}

const GENERATED: BeadPattern[] = [
  (() => {
    const { grid, palette } = rainbowGrid()
    return pixel({
      id: 'rainbow',
      name: '六色彩虹',
      category: 'festival',
      difficulty: 4,
      popularity: 98,
      createdAt: '2025-09-12',
      grid,
      palette,
      tip: '六色弧线逐圈拼，先外圈后内圈，小板放不下的治愈大作。',
    })
  })(),
  (() => {
    const { grid, palette } = bigHeartGrid()
    return pixel({
      id: 'big-heart',
      name: '告白大爱心',
      category: 'festival',
      difficulty: 4,
      popularity: 93,
      createdAt: '2025-08-25',
      grid,
      palette,
      tip: '45×41 格大作，左上蜜桃粉高光区建议最后补。',
    })
  })(),
  (() => {
    const { grid, palette } = sunsetGrid()
    return pixel({
      id: 'sunset',
      name: '日落大道',
      category: 'game',
      difficulty: 3,
      popularity: 81,
      createdAt: '2025-10-01',
      grid,
      palette,
      tip: '天空五色横带从下往上拼，太阳最后盖上去。',
    })
  })(),
  (() => {
    const { grid, palette } = waveGrid()
    return pixel({
      id: 'wave',
      name: '海浪波纹',
      category: 'symbol',
      difficulty: 2,
      popularity: 57,
      createdAt: '2025-06-28',
      grid,
      palette,
      tip: '深蓝浅蓝交替出波浪层次，浪尖白点别漏。',
    })
  })(),
]

/* ---------- 生成图稿（pattern-*.png） ---------- */

const IMAGE_PATTERNS: BeadPattern[] = [
  {
    id: 'heart',
    name: '经典爱心',
    category: 'festival',
    difficulty: 1,
    width: 29,
    height: 29,
    beads: 268,
    popularity: 100,
    createdAt: '2025-01-10',
    author: '豆豆工坊',
    image: '/pattern-heart.png',
    colors: [
      { beadId: 'R-01', count: 186 },
      { beadId: 'W-01', count: 58 },
      { beadId: 'R-03', count: 24 },
    ],
    tip: '入门首选！先拼白色高光，再填红色主体，砖红描右下阴影。',
  },
  {
    id: 'shiba',
    name: '柴犬君',
    category: 'animal',
    difficulty: 3,
    width: 29,
    height: 29,
    beads: 412,
    popularity: 97,
    createdAt: '2025-02-08',
    author: '豆豆工坊',
    image: '/pattern-shiba.png',
    colors: [
      { beadId: 'O-01', count: 208 },
      { beadId: 'K-02', count: 118 },
      { beadId: 'K-00', count: 44 },
      { beadId: 'W-01', count: 32 },
      { beadId: 'R-02', count: 10 },
    ],
    tip: '脸部奶白区域先拼，橘棕毛发从耳朵向四周推进。',
  },
  {
    id: 'cactus',
    name: '盆栽仙人掌',
    category: 'plant',
    difficulty: 2,
    width: 21,
    height: 25,
    beads: 286,
    popularity: 83,
    createdAt: '2025-03-12',
    author: '豆豆工坊',
    image: '/pattern-cactus.png',
    colors: [
      { beadId: 'G-01', count: 148 },
      { beadId: 'N-01', count: 74 },
      { beadId: 'G-03', count: 32 },
      { beadId: 'R-02', count: 18 },
      { beadId: 'K-00', count: 14 },
    ],
    tip: '深林绿做背光面，抹茶绿做受光面，层次立刻出来。',
  },
  {
    id: 'spaceship',
    name: '复古飞船',
    category: 'game',
    difficulty: 3,
    width: 25,
    height: 25,
    beads: 305,
    popularity: 90,
    createdAt: '2025-04-05',
    author: '豆豆工坊',
    image: '/pattern-spaceship.png',
    colors: [
      { beadId: 'B-01', count: 118 },
      { beadId: 'P-01', count: 62 },
      { beadId: 'K-00', count: 52 },
      { beadId: 'Y-01', count: 38 },
      { beadId: 'W-01', count: 20 },
      { beadId: 'B-02', count: 15 },
    ],
    tip: '暖黑星空背景先铺满，飞船主体再叠上去。',
  },
  {
    id: 'mushroom',
    name: '红蘑菇',
    category: 'game',
    difficulty: 2,
    width: 21,
    height: 21,
    beads: 196,
    popularity: 87,
    createdAt: '2025-05-16',
    author: '豆豆工坊',
    image: '/pattern-mushroom.png',
    colors: [
      { beadId: 'R-01', count: 94 },
      { beadId: 'K-02', count: 46 },
      { beadId: 'W-01', count: 34 },
      { beadId: 'K-00', count: 22 },
    ],
    tip: '伞盖白点位置随意一颗都会毁了经典感，严格照图。',
  },
  {
    id: 'cat',
    name: '夜猫子',
    category: 'animal',
    difficulty: 3,
    width: 25,
    height: 29,
    beads: 348,
    popularity: 89,
    createdAt: '2025-06-10',
    author: '豆豆工坊',
    image: '/pattern-cat.png',
    colors: [
      { beadId: 'K-00', count: 272 },
      { beadId: 'A-02', count: 34 },
      { beadId: 'Y-01', count: 26 },
      { beadId: 'W-01', count: 16 },
    ],
    tip: '暖黑用量大，建议多备一袋；岩石灰勾出猫背轮廓光。',
  },
  {
    id: 'cherry',
    name: '小樱桃',
    category: 'food',
    difficulty: 2,
    width: 21,
    height: 21,
    beads: 158,
    popularity: 94,
    createdAt: '2025-07-02',
    author: '豆豆工坊',
    image: '/pattern-cherry.png',
    colors: [
      { beadId: 'R-01', count: 96 },
      { beadId: 'G-01', count: 30 },
      { beadId: 'R-03', count: 18 },
      { beadId: 'W-01', count: 14 },
    ],
    tip: '两颗樱桃的遮挡关系看仔细，果柄最后连。',
  },
  {
    id: 'whale',
    name: '小鲸鱼',
    category: 'animal',
    difficulty: 2,
    width: 25,
    height: 21,
    beads: 244,
    popularity: 92,
    createdAt: '2025-08-19',
    author: '豆豆工坊',
    image: '/pattern-whale.png',
    colors: [
      { beadId: 'B-01', count: 128 },
      { beadId: 'B-02', count: 48 },
      { beadId: 'K-01', count: 34 },
      { beadId: 'W-01', count: 20 },
      { beadId: 'K-00', count: 14 },
    ],
    tip: '水花用婴儿蓝+纯白混搭，喷得越高越可爱。',
  },
]

/** 按上架时间排列的完整图案库（图稿优先展示） */
export const PATTERNS: BeadPattern[] = [
  ...IMAGE_PATTERNS,
  ...GENERATED,
  ...PIXEL_PATTERNS,
]

export function patternsUsingBead(beadId: string): BeadPattern[] {
  return PATTERNS.filter((p) => p.colors.some((c) => c.beadId === beadId))
}
