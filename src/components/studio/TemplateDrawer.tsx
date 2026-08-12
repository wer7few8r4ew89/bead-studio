import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Search, Wand2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/studio-engine'
import type { TemplateDef } from '@/lib/studio-engine'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface TemplateDrawerProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  overlay: { tpl: TemplateDef; visible: boolean } | null
  onOverlay: (tpl: TemplateDef) => void
  onToggleVisible: () => void
  onRemoveOverlay: () => void
  onFill: (tpl: TemplateDef) => void
  cols: number
  rows: number
}

export default function TemplateDrawer({
  open,
  onOpenChange,
  overlay,
  onOverlay,
  onToggleVisible,
  onRemoveOverlay,
  onFill,
  cols,
  rows,
}: TemplateDrawerProps) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('全部')

  const list = useMemo(
    () =>
      TEMPLATES.filter(
        (t) =>
          (cat === '全部' || t.category === cat) &&
          (!q.trim() || t.name.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [q, cat],
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[92vw] overflow-y-auto border-l border-dashed border-ash/25 bg-bead-white p-0 sm:w-[480px]"
      >
        <SheetHeader className="border-b border-dashed border-ash/25 px-5 py-4 text-left">
          <SheetTitle className="text-lg font-black text-ink">模板描图</SheetTitle>
          <SheetDescription className="text-xs text-ash">
            挑一个图案叠加到画布作为描图参考，或一键映射为真实豆色填入。
          </SheetDescription>
        </SheetHeader>

        {/* 当前叠加状态 */}
        {overlay && (
          <div className="mx-5 mt-4 rounded-card bg-sand p-3">
            <div className="flex items-center gap-3">
              <img src={overlay.tpl.src} alt={overlay.tpl.name} className="h-12 w-12 rounded-tag object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink">{overlay.tpl.name}</div>
                <div className="font-mono text-[11px] text-ash">
                  {overlay.tpl.cols}×{overlay.tpl.rows} · 叠加 60% {overlay.visible ? '· 显示中' : '· 已隐藏'}
                </div>
              </div>
              <button
                onClick={onToggleVisible}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ash transition-colors hover:bg-bead-white hover:text-ink"
                title={overlay.visible ? '隐藏叠加' : '显示叠加'}
              >
                {overlay.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                onClick={onRemoveOverlay}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ash transition-colors hover:bg-bead-white hover:text-cherry"
                title="移除叠加"
              >
                <X size={16} />
              </button>
            </div>
            <button
              onClick={() => onFill(overlay.tpl)}
              className="shadow-bead active:shadow-bead-pressed mt-2.5 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-grape text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Wand2 size={14} /> 描图填充（映射真实豆色）
            </button>
          </div>
        )}

        {/* 搜索 + 分类 */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-full border border-ash/30 bg-cream px-3.5">
            <Search size={14} className="shrink-0 text-ash" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索模板…"
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-ash/60"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {TEMPLATE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold transition-colors',
                  cat === c ? 'bg-cherry text-white' : 'bg-sand text-ash hover:bg-yolk/40 hover:text-ink',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 模板网格 */}
        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          {list.map((t, i) => {
            const active = overlay?.tpl.id === t.id
            const mismatch = t.cols !== cols || t.rows !== rows
            return (
              <motion.div
                key={t.id}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={cn(
                  'group relative overflow-hidden rounded-card border-2 bg-cream transition-all hover:-translate-y-1 hover:shadow-card',
                  active ? 'border-grape' : 'border-transparent hover:border-yolk',
                )}
              >
                <div className="bg-pegboard aspect-square">
                  <img src={t.src} alt={t.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between px-2.5 py-2">
                  <span className="truncate text-xs font-bold text-ink">{t.name}</span>
                  <span className="font-mono text-[10px] text-ash">{t.cols}×{t.rows}</span>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-ink/45 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    onClick={() => onOverlay(t)}
                    className="shadow-bead active:shadow-bead-pressed cursor-pointer rounded-full bg-yolk px-4 py-1.5 text-xs font-bold text-ink transition-all hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    叠加到画布
                  </button>
                  <button
                    onClick={() => onFill(t)}
                    className="cursor-pointer rounded-full bg-bead-white/90 px-4 py-1.5 text-xs font-bold text-ink transition-all hover:-translate-y-0.5"
                  >
                    直接填充
                  </button>
                  {mismatch && (
                    <span className="mt-1 rounded-full bg-bead-white/80 px-2 py-0.5 text-[10px] text-ash">
                      尺寸 {t.cols}×{t.rows} 与画布不同
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
          {list.length === 0 && (
            <p className="col-span-2 py-10 text-center text-xs text-ash">没有匹配的模板，换个关键词试试。</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
