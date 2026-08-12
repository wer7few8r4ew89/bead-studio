import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Lightbulb, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BEAD_FAMILIES } from '@/lib/bead-colors'
import type { BeadColor } from '@/lib/bead-colors'
import type { BeadStat } from '@/lib/studio-engine'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** 拟物豆球 */
export function BeadBall({
  color,
  size,
  selected,
  onClick,
  title,
}: {
  color: BeadColor
  size: number
  selected?: boolean
  onClick?: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? `${color.code} ${color.name}`}
      className={cn(
        'bead-ball group relative shrink-0 cursor-pointer touch-manipulation transition-all duration-150 hover:scale-[1.15] hover:-translate-y-0.5',
        selected && '-translate-y-0.5 ring-[3px] ring-ink ring-offset-2 ring-offset-bead-white',
      )}
      style={{ backgroundColor: color.hex, width: size, height: size }}
      aria-label={`${color.code} ${color.name}`}
    >
      <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-tag bg-ink px-1.5 py-0.5 font-mono text-[9px] text-sand opacity-0 transition-opacity group-hover:opacity-100">
        {color.code} {color.name}
      </span>
    </button>
  )
}

interface SidePanelProps {
  palette: BeadColor[]
  selected: number
  onSelect: (i: number) => void
  recent: number[]
  stats: BeadStat[]
  total: number
  coverage: number
  cols: number
  rows: number
  onCopyList: () => void
  boardWhite: boolean
  onBoardWhite: (v: boolean) => void
  gridMajor: number
  onGridMajor: (v: number) => void
  dotsOn: boolean
  onDotsOn: (v: boolean) => void
  createdAt: number
  editMs: number
  onAddCustom: (hex: string) => void
}

export default function SidePanel(p: SidePanelProps) {
  const cur = p.palette[p.selected] ?? p.palette[0]
  const customs = p.palette.filter((c) => c.custom)
  const [customOpen, setCustomOpen] = useState(false)
  const [hexDraft, setHexDraft] = useState('#E8452C')

  const validHex = /^#[0-9a-fA-F]{6}$/.test(hexDraft)
  const editMinutes = Math.floor(p.editMs / 60000)

  return (
    <div className={cn('flex h-full w-full flex-col border-ash/25 bg-bead-white lg:border-l lg:border-dashed')}>
      <Tabs defaultValue="palette" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-3 grid h-10 shrink-0 grid-cols-3 rounded-full bg-sand p-1">
          <TabsTrigger value="palette" className="rounded-full text-xs font-bold data-[state=active]:bg-bead-white data-[state=active]:text-cherry data-[state=active]:shadow-sm">
            调色盘
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-full text-xs font-bold data-[state=active]:bg-bead-white data-[state=active]:text-cherry data-[state=active]:shadow-sm">
            用豆统计
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full text-xs font-bold data-[state=active]:bg-bead-white data-[state=active]:text-cherry data-[state=active]:shadow-sm">
            图层设置
          </TabsTrigger>
        </TabsList>

        {/* ---------- Tab 1 · 调色盘 ---------- */}
        <TabsContent value="palette" className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <motion.div initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
            {/* 当前选中色 */}
            <div className="mt-3 flex items-center gap-3 rounded-card bg-sand p-3">
              <div
                className="bead-ball h-12 w-12 shrink-0"
                style={{ backgroundColor: cur.hex }}
              />
              <div className="min-w-0">
                <div className="font-mono text-sm font-bold text-ink">
                  {cur.code} <span className="font-sans">{cur.name}</span>
                </div>
                <div className="font-mono text-xs text-ash">{cur.hex}</div>
              </div>
            </div>

            {/* 6 色系家族 */}
            {BEAD_FAMILIES.map((fam, fi) => {
              const colors = p.palette
                .map((c, i) => ({ c, i }))
                .filter(({ c }) => c.family === fam.key)
              if (!colors.length) return null
              return (
                <div key={fam.key} className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[0].c.hex }} />
                    <span className="text-xs font-bold text-ash">{fam.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map(({ c, i }, ci) => (
                      <motion.div
                        key={c.code}
                        initial={{ y: -16, scale: 0.6, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        transition={{ delay: fi * 0.05 + ci * 0.03, type: 'spring', stiffness: 320, damping: 18 }}
                      >
                        <BeadBall color={c} size={40} selected={p.selected === i} onClick={() => p.onSelect(i)} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* 自定义色 */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-ash">自定义色</span>
                <button
                  onClick={() => setCustomOpen(true)}
                  className="flex items-center gap-1 rounded-full border-2 border-dashed border-ash/40 px-2.5 py-1 text-[11px] font-bold text-ash transition-colors hover:border-cherry hover:text-cherry"
                >
                  <Plus size={12} /> 自定义
                </button>
              </div>
              {customs.length ? (
                <div className="flex flex-wrap gap-2.5">
                  {customs.map((c) => {
                    const idx = p.palette.indexOf(c)
                    return <BeadBall key={c.code} color={c} size={40} selected={p.selected === idx} onClick={() => p.onSelect(idx)} />
                  })}
                </div>
              ) : (
                <p className="text-[11px] leading-relaxed text-ash/70">没有喜欢的颜色？点「+ 自定义」调配一颗专属豆。</p>
              )}
            </div>

            {/* 最近使用 */}
            {p.recent.length > 0 && (
              <div className="mt-5 border-t border-dashed border-ash/25 pt-3">
                <div className="mb-2 text-xs font-bold text-ash">最近使用</div>
                <div className="flex flex-wrap gap-2">
                  {p.recent.map((idx) => {
                    const c = p.palette[idx]
                    return c ? (
                      <BeadBall key={`${c.code}-${idx}`} color={c} size={24} selected={p.selected === idx} onClick={() => p.onSelect(idx)} />
                    ) : null
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* ---------- Tab 2 · 用豆统计 ---------- */}
        <TabsContent value="stats" className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <motion.div initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
            {/* 总览胶囊 */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: '总豆数', value: String(p.total) },
                { label: '用色', value: `${p.stats.length} 色` },
                { label: '覆盖率', value: `${Math.round(p.coverage * 100)}%` },
              ].map((s) => (
                <div key={s.label} className="rounded-card bg-sand px-2 py-2.5 text-center">
                  <div className="font-mono text-lg font-bold leading-none text-ink">{s.value}</div>
                  <div className="mt-1 text-[10px] text-ash">{s.label}</div>
                </div>
              ))}
            </div>

            {/* 实时清单 */}
            <div className="mt-4 space-y-2.5">
              {p.stats.length === 0 && (
                <p className="py-6 text-center text-xs text-ash">画布还是空的，摆下第一颗豆吧。</p>
              )}
              {p.stats.map((st) => {
                const c = p.palette[st.index]
                if (!c) return null
                return (
                  <div key={c.code} className="flex items-center gap-2.5">
                    <button
                      onClick={() => p.onSelect(st.index)}
                      className="bead-ball h-6 w-6 shrink-0 cursor-pointer"
                      style={{ backgroundColor: c.hex }}
                      title={`选用 ${c.code} ${c.name}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-xs font-bold text-ink">
                          <span className="font-mono text-[10px] text-ash">{c.code}</span> {c.name}
                        </span>
                        <motion.span
                          key={st.count}
                          initial={{ scale: 1.3, color: '#E8452C' }}
                          animate={{ scale: 1, color: '#2B2622' }}
                          transition={{ duration: 0.35 }}
                          className="font-mono text-base font-bold leading-none"
                        >
                          {st.count}
                        </motion.span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(3, st.ratio * 100)}%`, backgroundColor: c.hex }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 提示卡 */}
            <div className="mt-5 flex gap-2 rounded-card bg-sand p-3 text-[11px] leading-relaxed text-ash">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-yolk" />
              <span>
                实体配豆参考：{p.cols}×{p.rows} 底板满幅约需 {p.cols * p.rows} 豆。建议按清单数量 110% 备货。
              </span>
            </div>

            <button
              onClick={p.onCopyList}
              disabled={!p.stats.length}
              className="mt-3 flex h-11 w-full touch-manipulation items-center justify-center gap-1.5 rounded-full border-2 border-ink/70 text-sm font-bold text-ink transition-colors hover:border-cherry hover:text-cherry disabled:opacity-30"
            >
              <Copy size={14} /> 复制清单
            </button>
          </motion.div>
        </TabsContent>

        {/* ---------- Tab 3 · 图层与设置 ---------- */}
        <TabsContent value="settings" className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <motion.div initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="space-y-4 pt-3">
            <div className="space-y-3 rounded-card bg-sand p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">白色底板</div>
                  <div className="text-[11px] text-ash">关闭后底板透明（影响导出）</div>
                </div>
                <Switch checked={p.boardWhite} onCheckedChange={p.onBoardWhite} />
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-ash/25 pt-3">
                <div>
                  <div className="text-sm font-bold text-ink">底板凹槽圆点</div>
                  <div className="text-[11px] text-ash">空格显示底板孔位</div>
                </div>
                <Switch checked={p.dotsOn} onCheckedChange={p.onDotsOn} />
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-ash/25 pt-3">
                <div>
                  <div className="text-sm font-bold text-ink">网格线密度</div>
                  <div className="text-[11px] text-ash">加粗参考线间隔</div>
                </div>
                <Select value={String(p.gridMajor)} onValueChange={(v) => p.onGridMajor(parseInt(v, 10))}>
                  <SelectTrigger className="h-8 w-24 rounded-full border-ash/30 bg-bead-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" className="text-xs">仅细线</SelectItem>
                    <SelectItem value="5" className="text-xs">每 5 格</SelectItem>
                    <SelectItem value="10" className="text-xs">每 10 格</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-card bg-sand p-3.5">
              <div className="mb-2.5 text-sm font-bold text-ink">作品信息</div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-ash">创建时间</dt>
                  <dd className="font-mono text-ink">{new Date(p.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ash">编辑时长</dt>
                  <dd className="font-mono text-ink">{editMinutes >= 60 ? `${Math.floor(editMinutes / 60)} 小时 ${editMinutes % 60} 分` : `${editMinutes} 分钟`}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ash">画布尺寸</dt>
                  <dd className="font-mono text-ink">{p.cols} × {p.rows}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ash">已用豆数</dt>
                  <dd className="font-mono text-ink">{p.total} / {p.cols * p.rows}</dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* 自定义取色 Dialog */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-sm rounded-card border-ash/20 bg-bead-white">
          <DialogHeader>
            <DialogTitle className="text-ink">自定义豆色</DialogTitle>
            <DialogDescription className="text-ash">输入 HEX 或直接拾取颜色，将标记为 C 系列自定义豆。</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={validHex ? hexDraft : '#E8452C'}
              onChange={(e) => setHexDraft(e.target.value.toUpperCase())}
              className="h-12 w-16 shrink-0 cursor-pointer rounded-tag border border-ash/30 bg-transparent p-1"
              aria-label="色盘拾取"
            />
            <input
              value={hexDraft}
              onChange={(e) => setHexDraft(e.target.value)}
              placeholder="#E8452C"
              maxLength={7}
              className={cn(
                'h-10 flex-1 rounded-tag border bg-cream px-3 font-mono text-sm uppercase outline-none',
                validHex ? 'border-ash/30 focus:border-cherry' : 'border-cherry',
              )}
              aria-label="HEX 色值"
            />
            <div className="bead-ball h-10 w-10 shrink-0" style={{ backgroundColor: validHex ? hexDraft : '#E8452C' }} />
          </div>
          {!validHex && hexDraft.length > 1 && <p className="text-[11px] text-cherry">请输入 6 位 HEX 色值，如 #58A05C</p>}
          <DialogFooter>
            <button
              disabled={!validHex}
              onClick={() => {
                p.onAddCustom(hexDraft.toUpperCase())
                setCustomOpen(false)
              }}
              className="shadow-bead hover:bg-[#F05036] active:shadow-bead-pressed inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full bg-cherry text-sm font-bold text-white transition-all disabled:opacity-40"
            >
              加入调色盘
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
