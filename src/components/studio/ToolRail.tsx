import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { LayoutGrid, FlipHorizontal2, FileImage } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tool } from '@/lib/studio-engine'

/* 8-bit 像素风工具图标（2px 像素块，24 网格） */
function PixBrush({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M17 3h4v4h-4z" fill="#E8452C" />
      <path d="M13 7h4v4h-4zM15 5h2v2h-2z" fill="#F08A1D" />
      <path d="M9 11h4v4H9z" fill="#FFC93C" />
      <path d="M5 15h4v4H5z" fill="#A9714B" />
      <path d="M3 19h4v2H3zM3 17h2v2H3z" fill="#2B2622" />
    </svg>
  )
}
function PixBucket({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 4h8v2H8zM6 6h12v8H6z" fill="#3E8EDE" />
      <path d="M8 8h8v4H8z" fill="#7FC4E8" />
      <path d="M4 6h2v8H4zM18 6h2v8h-2z" fill="#2C4E8A" />
      <path d="M10 16h4v2h-4zM11 18h2v4h-2z" fill="#3E8EDE" />
    </svg>
  )
}
function PixPicker({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M14 2h6v6h-6z" fill="#8B5FBF" />
      <path d="M12 6h4v4h-4zM10 8h4v4h-4z" fill="#B79AD9" />
      <path d="M8 12h4v4H8z" fill="#3E8EDE" />
      <path d="M5 15h4v5H5z" fill="#2B2622" />
      <path d="M3 20h2v2H3z" fill="#E8452C" />
    </svg>
  )
}
function PixEraser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 6h10v6H8z" fill="#F2718C" />
      <path d="M6 8h4v6H6z" fill="#7FC4E8" />
      <path d="M4 14h16v4H4z" fill="#2B2622" opacity="0.9" />
      <path d="M14 18h6v2h-6z" fill="#8A8177" />
    </svg>
  )
}
function PixHand({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M9 3h2v8H9zM12 2h2v9h-2zM15 4h2v8h-2zM18 7h2v7h-2z" fill="#FFC93C" />
      <path d="M6 10h3v4H6z" fill="#F08A1D" />
      <path d="M8 12h12v6H8zM9 18h9v3H9z" fill="#FFC93C" />
    </svg>
  )
}

const TOOLS: Array<{ id: Tool; label: string; key: string; icon: (cls: string) => ReactNode }> = [
  { id: 'brush', label: '画笔', key: 'B', icon: (c) => <PixBrush className={c} /> },
  { id: 'bucket', label: '油漆桶', key: 'G', icon: (c) => <PixBucket className={c} /> },
  { id: 'picker', label: '取色器', key: 'I', icon: (c) => <PixPicker className={c} /> },
  { id: 'eraser', label: '橡皮', key: 'E', icon: (c) => <PixEraser className={c} /> },
  { id: 'hand', label: '移动画布', key: 'H', icon: (c) => <PixHand className={c} /> },
]

interface ToolRailProps {
  tool: Tool
  onToolChange: (t: Tool) => void
  gridOn: boolean
  onToggleGrid: () => void
  mirror: boolean
  onToggleMirror: () => void
  onOpenTemplates: () => void
  /** vertical = 桌面左侧竖排；horizontal = 移动端底部横排 */
  orientation?: 'vertical' | 'horizontal'
}

export default function ToolRail({
  tool,
  onToolChange,
  gridOn,
  onToggleGrid,
  mirror,
  onToggleMirror,
  onOpenTemplates,
  orientation = 'vertical',
}: ToolRailProps) {
  const vertical = orientation === 'vertical'
  return (
    <div
      className={cn(
        'flex shrink-0 items-center border-ash/25 bg-bead-white',
        vertical
          ? 'w-16 flex-col gap-1.5 overflow-y-auto border-r border-dashed py-3'
          : 'w-full flex-row gap-1.5 overflow-x-auto border-t border-dashed px-3 py-2',
      )}
    >
      {TOOLS.map((t) => {
        const active = tool === t.id
        return (
          <div key={t.id} className={cn('group relative', !vertical && 'shrink-0')}>
            <motion.button
              whileTap={{ scale: 0.85 }}
              animate={active ? { scale: [0.85, 1] } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              onClick={() => onToolChange(t.id)}
              className={cn(
                'relative flex h-11 w-11 items-center justify-center rounded-tag transition-colors',
                active ? 'bg-yolk/30' : 'hover:bg-sand',
              )}
              aria-label={`${t.label} (${t.key})`}
            >
              {active && vertical && <span className="absolute -left-[11px] top-1.5 h-8 w-1 rounded-full bg-cherry" />}
              {active && !vertical && <span className="absolute -bottom-2 left-1/2 h-1 w-7 -translate-x-1/2 rounded-full bg-cherry" />}
              <span className="transition-transform duration-150 group-hover:scale-110">{t.icon('h-6 w-6')}</span>
            </motion.button>
            {vertical && (
              <span className="pointer-events-none absolute left-[52px] top-1/2 z-20 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-tag bg-ink px-2 py-1 text-[11px] font-bold text-sand opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                {t.label} <kbd className="ml-1 font-mono text-[9px] text-sand/60">{t.key}</kbd>
              </span>
            )}
          </div>
        )
      })}

      <div className={cn(vertical ? 'my-1 h-px w-8 bg-ash/25' : 'mx-1 h-8 w-px shrink-0 bg-ash/25')} />

      {/* 模板抽屉 */}
      <div className={cn('group relative', !vertical && 'shrink-0')}>
        <button
          onClick={onOpenTemplates}
          className="flex h-11 w-11 items-center justify-center rounded-tag transition-colors hover:bg-sand"
          aria-label="模板 (T)"
        >
          <span className="text-grape transition-transform duration-150 group-hover:scale-110">
            <FileImage size={22} />
          </span>
        </button>
        {vertical && (
          <span className="pointer-events-none absolute left-[52px] top-1/2 z-20 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-tag bg-ink px-2 py-1 text-[11px] font-bold text-sand opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
            模板 <kbd className="ml-1 font-mono text-[9px] text-sand/60">T</kbd>
          </span>
        )}
      </div>

      {/* 网格线开关 */}
      <div className={cn('group relative', !vertical && 'shrink-0')}>
        <button
          onClick={onToggleGrid}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-tag transition-colors',
            gridOn ? 'bg-yolk/30 text-ink' : 'text-ash hover:bg-sand',
          )}
          aria-label="网格线开关"
        >
          <LayoutGrid size={20} className="transition-transform duration-150 group-hover:scale-110" />
        </button>
        {vertical && (
          <span className="pointer-events-none absolute left-[52px] top-1/2 z-20 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-tag bg-ink px-2 py-1 text-[11px] font-bold text-sand opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
            网格线 {gridOn ? '开' : '关'}
          </span>
        )}
      </div>

      {/* 镜像开关 */}
      <div className={cn('group relative', !vertical && 'shrink-0')}>
        <button
          onClick={onToggleMirror}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-tag transition-colors',
            mirror ? 'bg-yolk/30 text-ink' : 'text-ash hover:bg-sand',
          )}
          aria-label="镜像辅助开关"
        >
          <FlipHorizontal2 size={20} className="transition-transform duration-150 group-hover:scale-110" />
        </button>
        {vertical && (
          <span className="pointer-events-none absolute left-[52px] top-1/2 z-20 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-tag bg-ink px-2 py-1 text-[11px] font-bold text-sand opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
            水平镜像 {mirror ? '开' : '关'}
          </span>
        )}
      </div>
    </div>
  )
}
