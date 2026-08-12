import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoreHorizontal, Redo2, Share2, Trash2, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOARD_SIZES } from '@/lib/studio-engine'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TopBarProps {
  name: string
  savedAt: number | null
  cols: number
  rows: number
  onNameChange: (name: string) => void
  onSizeChange: (cols: number, rows: number) => void
  onCustomSize: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onExport: () => void
}

export default function TopBar({
  name,
  savedAt,
  cols,
  rows,
  onNameChange,
  onSizeChange,
  onCustomSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onExport,
}: TopBarProps) {
  const [draft, setDraft] = useState(name)
  const [wiggle, setWiggle] = useState<'undo' | 'redo' | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setDraft(name), [name])

  /* 溢出菜单：点击外部 / Esc 关闭 */
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const commit = () => {
    const v = draft.trim()
    onNameChange(v || '未命名作品')
    inputRef.current?.blur()
  }

  const sizeValue =
    BOARD_SIZES.findIndex((s) => s.cols === cols && s.rows === rows).toString() === '-1'
      ? 'custom'
      : String(BOARD_SIZES.findIndex((s) => s.cols === cols && s.rows === rows))

  const handleUndo = () => {
    if (!canUndo) return
    onUndo()
    setWiggle('undo')
  }
  const handleRedo = () => {
    if (!canRedo) return
    onRedo()
    setWiggle('redo')
  }

  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-dashed border-ash/25 bg-bead-white px-3 sm:gap-3 sm:px-4">
      {/* 作品名 + 保存状态 */}
      <div className="flex min-w-0 items-center gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          maxLength={24}
          className="w-20 truncate rounded-tag border border-transparent bg-transparent px-1.5 py-1 text-sm font-bold text-ink outline-none transition-colors hover:border-ash/30 focus:border-cherry sm:w-44 sm:px-2"
          aria-label="作品名"
        />
        <span className="hidden whitespace-nowrap text-[11px] text-ash md:block">
          {savedAt
            ? `已自动保存 ${new Date(savedAt).toTimeString().slice(0, 5)}`
            : '编辑后自动保存'}
        </span>
      </div>

      {/* 画布尺寸 */}
      <div className="mx-auto">
        <Select
          value={sizeValue}
          onValueChange={(v) => {
            if (v === 'custom') {
              onCustomSize()
              return
            }
            const s = BOARD_SIZES[parseInt(v, 10)]
            if (s && (s.cols !== cols || s.rows !== rows)) onSizeChange(s.cols, s.rows)
          }}
        >
          <SelectTrigger className="h-11 w-[112px] rounded-full border-ash/30 bg-cream text-xs font-bold sm:h-9 sm:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BOARD_SIZES.map((s, i) => (
              <SelectItem key={s.label} value={String(i)} className="text-xs">
                <span className="font-mono">{s.label.split(' ')[0]}</span> {s.label.split(' ')[1]}
              </SelectItem>
            ))}
            <SelectItem value="custom" className="text-xs">
              自定义…
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 撤销 / 重做 / 清空 / 导出（移动端精简进溢出菜单） */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <motion.button
          animate={wiggle === 'undo' ? { rotate: [0, -15, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => setWiggle(null)}
          onClick={handleUndo}
          disabled={!canUndo}
          className={cn(
            'hidden h-9 w-9 items-center justify-center rounded-full border-2 border-ink/15 text-ink transition-colors hover:border-cherry hover:text-cherry sm:flex',
            !canUndo && 'opacity-30 hover:border-ink/15 hover:text-ink',
          )}
          title="撤销 (Ctrl+Z)"
          aria-label="撤销"
        >
          <Undo2 size={16} />
        </motion.button>
        <motion.button
          animate={wiggle === 'redo' ? { rotate: [0, 15, -10, 0] } : {}}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => setWiggle(null)}
          onClick={handleRedo}
          disabled={!canRedo}
          className={cn(
            'hidden h-9 w-9 items-center justify-center rounded-full border-2 border-ink/15 text-ink transition-colors hover:border-cherry hover:text-cherry sm:flex',
            !canRedo && 'opacity-30 hover:border-ink/15 hover:text-ink',
          )}
          title="重做 (Ctrl+Shift+Z)"
          aria-label="重做"
        >
          <Redo2 size={16} />
        </motion.button>
        <button
          onClick={onClear}
          className="hidden h-9 w-9 items-center justify-center rounded-full border-2 border-ink/15 text-ink transition-colors hover:border-cherry hover:text-cherry sm:flex"
          title="清空画布"
          aria-label="清空画布"
        >
          <Trash2 size={16} />
        </button>

        {/* 移动端溢出菜单 */}
        <div ref={menuRef} className="relative sm:hidden">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border-2 border-ink/15 text-ink transition-colors hover:border-cherry hover:text-cherry"
            aria-label="更多操作"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={18} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-[52px] z-50 w-40 overflow-hidden rounded-card border border-ash/20 bg-bead-white py-1 shadow-hero-card"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    handleUndo()
                  }}
                  disabled={!canUndo}
                  className="flex h-11 w-full touch-manipulation items-center gap-2.5 px-4 text-sm font-bold text-ink transition-colors hover:bg-sand disabled:opacity-30"
                >
                  <Undo2 size={16} /> 撤销
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    handleRedo()
                  }}
                  disabled={!canRedo}
                  className="flex h-11 w-full touch-manipulation items-center gap-2.5 px-4 text-sm font-bold text-ink transition-colors hover:bg-sand disabled:opacity-30"
                >
                  <Redo2 size={16} /> 重做
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onClear()
                  }}
                  className="flex h-11 w-full touch-manipulation items-center gap-2.5 px-4 text-sm font-bold text-cherry transition-colors hover:bg-sand"
                >
                  <Trash2 size={16} /> 清空画布
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onExport}
          className="shadow-bead hover:bg-[#F05036] active:shadow-bead-pressed ml-1 inline-flex h-11 w-11 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-cherry text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 sm:h-9 sm:w-auto sm:px-5"
          aria-label="导出图纸"
        >
          <Share2 size={16} className="sm:hidden" />
          <span className="hidden sm:inline">导出图纸</span>
        </button>
      </div>
    </div>
  )
}
