import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, FileText, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BeadColor } from '@/lib/bead-colors'
import { renderBlueprint } from '@/lib/studio-export'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ExportMode = 'png' | 'pdf' | 'link'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  name: string
  cols: number
  rows: number
  gridRef: MutableRefObject<Int16Array>
  palette: BeadColor[]
  boardWhite: boolean
  shareUrl: string
  onDownloadPng: () => void
  onPrintPdf: () => void
  onCopyLink: () => void
}

export default function ExportDialog({
  open,
  onOpenChange,
  name,
  cols,
  rows,
  gridRef,
  palette,
  boardWhite,
  shareUrl,
  onDownloadPng,
  onPrintPdf,
  onCopyLink,
}: ExportDialogProps) {
  const [mode, setMode] = useState<ExportMode>('png')
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewKey, setPreviewKey] = useState(0)

  /* 打开时生成图纸预览 */
  useEffect(() => {
    if (!open) return
    const box = previewRef.current
    if (!box) return
    const timer = setTimeout(() => {
      const cv = renderBlueprint({ name, cols, rows, grid: gridRef.current, palette, boardWhite, cell: cols > 40 ? 18 : 24 })
      const scale = Math.min(1, 560 / cv.width)
      cv.style.width = `${cv.width * scale}px`
      cv.style.height = `${cv.height * scale}px`
      cv.className = 'rounded-tag shadow-card'
      box.innerHTML = ''
      box.appendChild(cv)
      setPreviewKey((k) => k + 1)
    }, 60)
    return () => clearTimeout(timer)
  }, [open, name, cols, rows, gridRef, palette, boardWhite])

  const modes: Array<{ id: ExportMode; label: string; icon: React.ReactNode }> = [
    { id: 'png', label: 'PNG 图纸', icon: <Download size={14} /> },
    { id: 'pdf', label: 'PDF 打印版', icon: <FileText size={14} /> },
    { id: 'link', label: '分享链接', icon: <Link2 size={14} /> },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[94vw] max-w-2xl overflow-y-auto rounded-card border-ash/20 bg-bead-white p-0">
        {/* 顶部彩色小豆装饰线 */}
        <div className="flex justify-center gap-1.5 pt-4" aria-hidden="true">
          {['#E8452C', '#F08A1D', '#FFC93C', '#58A05C', '#3E8EDE', '#8B5FBF', '#F5A8C0'].map((c) => (
            <span key={c} className="bead-ball h-3 w-3" style={{ backgroundColor: c }} />
          ))}
        </div>
        <DialogHeader className="px-6 pt-2 text-left">
          <DialogTitle className="text-xl font-black text-ink">导出图纸</DialogTitle>
          <DialogDescription className="text-xs text-ash">
            {name || '未命名作品'} · {cols}×{rows} · 带坐标与色号标注，按图纸去实体店配豆即可。
          </DialogDescription>
        </DialogHeader>

        {/* 预览区：像素化 → 清晰 */}
        <div className="mx-6 max-h-[46dvh] overflow-auto rounded-card bg-sand p-4">
          <motion.div
            key={previewKey}
            initial={{ opacity: 0, filter: 'blur(6px)', scale: 0.98 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div ref={previewRef} />
          </motion.div>
        </div>

        {/* 导出选项（radio 豆钮） */}
        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all',
                mode === m.id
                  ? 'shadow-bead active:shadow-bead-pressed border-cherry bg-cherry text-white'
                  : 'border-ink/20 text-ink hover:border-cherry hover:text-cherry',
              )}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 pt-4">
          {mode === 'png' && (
            <button
              onClick={onDownloadPng}
              className="shadow-bead hover:bg-[#F05036] active:shadow-bead-pressed flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-cherry font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Download size={16} /> 下载 PNG 图纸
            </button>
          )}
          {mode === 'pdf' && (
            <div className="space-y-2">
              <button
                onClick={onPrintPdf}
                className="shadow-bead hover:bg-[#F05036] active:shadow-bead-pressed flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-cherry font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <FileText size={16} /> 打开打印窗口
              </button>
              <p className="text-center text-[11px] text-ash">在系统打印对话框中选择「另存为 PDF」即可。</p>
            </div>
          )}
          {mode === 'link' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                  className="h-10 min-w-0 flex-1 rounded-tag border border-ash/30 bg-cream px-3 font-mono text-xs text-ink outline-none"
                />
                <button
                  onClick={onCopyLink}
                  className="shadow-bead hover:bg-[#FFD25E] active:shadow-bead-pressed flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-yolk px-4 text-sm font-bold text-ink transition-all"
                >
                  <Copy size={14} /> 复制链接
                </button>
              </div>
              <div className="flex items-center gap-3 rounded-card bg-sand p-3">
                {/* 二维码占位：像素块装饰 */}
                <div className="grid h-16 w-16 shrink-0 grid-cols-8 gap-px rounded-tag bg-bead-white p-1.5" aria-hidden="true">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <span
                      key={i}
                      className="rounded-[1px]"
                      style={{ backgroundColor: (i * 7 + ((i / 8) | 0) * 3) % 5 < 2 ? '#2B2622' : 'transparent' }}
                    />
                  ))}
                </div>
                <p className="text-[11px] leading-relaxed text-ash">
                  链接已包含整幅作品的豆色数据，朋友打开即可在工坊中继续编辑。二维码功能即将上线。
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
