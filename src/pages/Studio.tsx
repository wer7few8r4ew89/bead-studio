import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp, CircleCheck, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BEAD_COLORS, makeCustomColor } from '@/lib/bead-colors'
import type { BeadColor } from '@/lib/bead-colors'
import {
  computeStats,
  createGrid,
  decodeShare,
  encodeShare,
  imageToGrid,
  loadWork,
  resizeGrid,
  saveWork,
} from '@/lib/studio-engine'
import type { TemplateDef, Tool } from '@/lib/studio-engine'
import { buildListText, downloadCanvasPng, printBlueprint, renderBlueprint } from '@/lib/studio-export'
import BeadCanvas from '@/components/studio/BeadCanvas'
import TopBar from '@/components/studio/TopBar'
import ToolRail from '@/components/studio/ToolRail'
import SidePanel from '@/components/studio/SidePanel'
import TemplateDrawer from '@/components/studio/TemplateDrawer'
import ExportDialog from '@/components/studio/ExportDialog'
import WelcomeCard from '@/components/studio/WelcomeCard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface InitData {
  name: string
  cols: number
  rows: number
  grid: Int16Array
  customs: BeadColor[]
  createdAt: number
  editMs: number
  fromShare: boolean
}

function readInitial(): InitData | null {
  try {
    const hash = window.location.hash
    if (hash.startsWith('#p=')) {
      const d = decodeShare(hash.slice(3))
      if (d) {
        return { ...d, createdAt: Date.now(), editMs: 0, fromShare: true }
      }
    }
  } catch {
    /* ignore */
  }
  const w = loadWork()
  if (w) {
    return {
      name: w.name,
      cols: w.cols,
      rows: w.rows,
      grid: Int16Array.from(w.grid),
      customs: w.customs ?? [],
      createdAt: w.createdAt,
      editMs: w.editMs ?? 0,
      fromShare: false,
    }
  }
  return null
}

export default function Studio() {
  const init = useMemo(readInitial, [])

  /* ---------- 核心状态 ---------- */
  const [name, setName] = useState(init?.name ?? '未命名作品')
  const [size, setSize] = useState({ cols: init?.cols ?? 29, rows: init?.rows ?? 29 })
  const gridRef = useRef<Int16Array>(init?.grid ?? createGrid(29, 29))
  const [customs, setCustoms] = useState<BeadColor[]>(init?.customs ?? [])
  const palette = useMemo(() => [...BEAD_COLORS, ...customs], [customs])
  const [version, bump] = useReducer((x: number) => x + 1, 0)

  const [tool, setTool] = useState<Tool>('brush')
  const [selected, setSelected] = useState(0)
  const [recent, setRecent] = useState<number[]>([])
  const [mirror, setMirror] = useState(false)
  const [gridOn, setGridOn] = useState(true)
  const [gridMajor, setGridMajor] = useState(5)
  const [dotsOn, setDotsOn] = useState(true)
  const [boardWhite, setBoardWhite] = useState(true)

  const [overlay, setOverlay] = useState<{ tpl: TemplateDef; visible: boolean } | null>(null)
  const [overlayImg, setOverlayImg] = useState<HTMLImageElement | null>(null)
  const [rainKey, setRainKey] = useState(init?.fromShare ? 1 : 0)

  const [welcome, setWelcome] = useState(!init)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [createdAt] = useState(init?.createdAt ?? Date.now())
  const editMsRef = useRef(init?.editMs ?? 0)
  const lastEditTickRef = useRef(Date.now())
  const [editMs, setEditMs] = useState(editMsRef.current)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [customSizeOpen, setCustomSizeOpen] = useState(false)
  const [customCols, setCustomCols] = useState(35)
  const [customRows, setCustomRows] = useState(35)
  const [mismatchTpl, setMismatchTpl] = useState<TemplateDef | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null)

  const pastRef = useRef<Int16Array[]>([])
  const futureRef = useRef<Int16Array[]>([])
  const [histTick, setHistTick] = useState(0)

  const showToast = useCallback((msg: string) => setToast({ msg, key: Date.now() }), [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  /* ---------- 历史 ---------- */
  const pushHistory = useCallback(() => {
    pastRef.current.push(gridRef.current.slice())
    if (pastRef.current.length > 100) pastRef.current.shift()
    futureRef.current = []
    setHistTick((t) => t + 1)
  }, [])

  const undo = useCallback(() => {
    const prev = pastRef.current.pop()
    if (!prev) return
    futureRef.current.push(gridRef.current.slice())
    gridRef.current = prev
    bump()
    setHistTick((t) => t + 1)
  }, [])

  const redo = useCallback(() => {
    const next = futureRef.current.pop()
    if (!next) return
    pastRef.current.push(gridRef.current.slice())
    gridRef.current = next
    bump()
    setHistTick((t) => t + 1)
  }, [])

  const canUndo = histTick >= 0 && pastRef.current.length > 0
  const canRedo = histTick >= 0 && futureRef.current.length > 0

  /* ---------- 统计 ---------- */
  const { stats, total, coverage } = useMemo(
    () => computeStats(gridRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, size],
  )

  /* ---------- 调色 ---------- */
  const selectColor = useCallback((i: number) => {
    setSelected(i)
    setRecent((prev) => [i, ...prev.filter((x) => x !== i)].slice(0, 8))
    /* 取色后自动切回画笔，保持绘制节奏 */
    setTool((t) => (t === 'picker' ? 'brush' : t))
  }, [])

  const addCustom = useCallback(
    (hex: string) => {
      const c = makeCustomColor(hex)
      setCustoms((prev) => {
        const next = [...prev, c]
        setSelected(BEAD_COLORS.length + next.length - 1)
        return next
      })
      showToast(`${c.code} 自定义豆已加入`)
    },
    [showToast],
  )

  /* ---------- 画布操作 ---------- */
  const handleSizeChange = useCallback(
    (cols: number, rows: number) => {
      pushHistory()
      gridRef.current = resizeGrid(gridRef.current, size.cols, size.rows, cols, rows)
      setSize({ cols, rows })
      bump()
    },
    [pushHistory, size],
  )

  const handleClear = useCallback(() => {
    pushHistory()
    gridRef.current = createGrid(size.cols, size.rows)
    bump()
    setClearOpen(false)
    showToast('画布已清空')
  }, [pushHistory, size, showToast])

  /* ---------- 模板 ---------- */
  useEffect(() => {
    if (!overlay) {
      setOverlayImg(null)
      return
    }
    const img = new Image()
    img.src = overlay.tpl.src
    img.onload = () => setOverlayImg(img)
    return () => {
      img.onload = null
    }
  }, [overlay])

  const doFill = useCallback(
    (tpl: TemplateDef) => {
      const img = new Image()
      img.src = tpl.src
      img.onload = () => {
        pushHistory()
        gridRef.current = imageToGrid(img, tpl.cols, tpl.rows)
        setSize({ cols: tpl.cols, rows: tpl.rows })
        bump()
        setRainKey((k) => k + 1)
        showToast(`「${tpl.name}」已映射为真实豆色`)
      }
      img.onerror = () => showToast('模板载入失败，请重试')
    },
    [pushHistory, showToast],
  )

  const handleFill = useCallback(
    (tpl: TemplateDef) => {
      if (tpl.cols !== size.cols || tpl.rows !== size.rows) {
        setMismatchTpl(tpl)
        return
      }
      doFill(tpl)
    },
    [size, doFill],
  )

  /* ---------- 自动保存 ---------- */
  useEffect(() => {
    const t = setTimeout(() => {
      const now = Date.now()
      const gap = now - lastEditTickRef.current
      lastEditTickRef.current = now
      if (gap < 5 * 60 * 1000) editMsRef.current += gap
      setEditMs(editMsRef.current)
      saveWork({
        name,
        cols: size.cols,
        rows: size.rows,
        grid: Array.from(gridRef.current),
        customs,
        createdAt,
        savedAt: now,
        editMs: editMsRef.current,
      })
      setSavedAt(now)
    }, 900)
    return () => clearTimeout(t)
  }, [version, name, size, customs, createdAt])

  /* ---------- 快捷键 ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || (el as HTMLElement).isContentEditable)) return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
        return
      }
      if (mod) return
      switch (e.key.toLowerCase()) {
        case 'b': setTool('brush'); break
        case 'g': setTool('bucket'); break
        case 'i': setTool('picker'); break
        case 'e': setTool('eraser'); break
        case 'h': setTool('hand'); break
        case 't': setDrawerOpen((v) => !v); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  /* ---------- 导出 ---------- */
  const shareUrl = useMemo(
    () =>
      exportOpen
        ? `${window.location.origin}${window.location.pathname}#p=${encodeShare(name, size.cols, size.rows, gridRef.current, customs)}`
        : '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exportOpen, version, name, size, customs],
  )

  const copyText = useCallback(
    (text: string, okMsg: string) => {
      const done = () => showToast(okMsg)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done, () => showToast('复制失败，请手动复制'))
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        try {
          document.execCommand('copy')
          done()
        } catch {
          showToast('复制失败，请手动复制')
        }
        ta.remove()
      }
    },
    [showToast],
  )

  const handleDownloadPng = useCallback(() => {
    const cv = renderBlueprint({
      name,
      cols: size.cols,
      rows: size.rows,
      grid: gridRef.current,
      palette,
      boardWhite,
      cell: size.cols > 40 ? 16 : 26,
    })
    downloadCanvasPng(cv, `${name || 'bead-work'}-${size.cols}x${size.rows}.png`)
    showToast('PNG 图纸已下载')
  }, [name, size, palette, boardWhite, showToast])

  const handlePrintPdf = useCallback(() => {
    const cv = renderBlueprint({
      name,
      cols: size.cols,
      rows: size.rows,
      grid: gridRef.current,
      palette,
      boardWhite,
      cell: size.cols > 40 ? 16 : 26,
    })
    if (!printBlueprint(cv, `${name || 'bead-work'}-blueprint`)) showToast('弹窗被拦截，请允许弹出窗口')
  }, [name, size, palette, boardWhite, showToast])

  const handleCopyList = useCallback(() => {
    copyText(buildListText(name, size.cols, size.rows, gridRef.current, palette), '用豆清单已复制')
  }, [copyText, name, size, palette])

  /* ---------- 面板共享 props ---------- */
  const panelProps = {
    palette,
    selected,
    onSelect: selectColor,
    recent,
    stats,
    total,
    coverage,
    cols: size.cols,
    rows: size.rows,
    onCopyList: handleCopyList,
    boardWhite,
    onBoardWhite: setBoardWhite,
    gridMajor,
    onGridMajor: setGridMajor,
    dotsOn,
    onDotsOn: setDotsOn,
    createdAt,
    editMs,
    onAddCustom: addCustom,
  }

  return (
    <div className="flex h-[calc(100dvh-72px)] min-h-[480px] flex-col overflow-hidden bg-sand">
      <TopBar
        name={name}
        savedAt={savedAt}
        cols={size.cols}
        rows={size.rows}
        onNameChange={setName}
        onSizeChange={handleSizeChange}
        onCustomSize={() => setCustomSizeOpen(true)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onClear={() => setClearOpen(true)}
        onExport={() => setExportOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        {/* 左侧工具栏（桌面） */}
        <div className="hidden lg:flex">
          <ToolRail
            tool={tool}
            onToolChange={setTool}
            gridOn={gridOn}
            onToggleGrid={() => setGridOn((v) => !v)}
            mirror={mirror}
            onToggleMirror={() => setMirror((v) => !v)}
            onOpenTemplates={() => setDrawerOpen(true)}
          />
        </div>

        {/* 中央画布 */}
        <div className="bg-pegboard relative min-w-0 flex-1">
          <BeadCanvas
            cols={size.cols}
            rows={size.rows}
            gridRef={gridRef}
            palette={palette}
            tool={tool}
            colorIdx={selected}
            mirror={mirror}
            gridOn={gridOn}
            gridMajor={gridMajor}
            dotsOn={dotsOn}
            boardWhite={boardWhite}
            overlayImg={overlay?.visible ? overlayImg : null}
            overlayOpacity={0.6}
            rainKey={rainKey}
            onPaintStart={pushHistory}
            onPaint={bump}
            onPickColor={selectColor}
          />
          <WelcomeCard
            open={welcome}
            onFromTemplate={() => {
              setWelcome(false)
              setDrawerOpen(true)
            }}
            onBlank={() => setWelcome(false)}
          />
        </div>

        {/* 右侧面板（桌面） */}
        <div className="hidden w-80 shrink-0 lg:block">
          <SidePanel {...panelProps} />
        </div>
      </div>

      {/* 移动端底部工具栏 */}
      <div className="flex items-center bg-bead-white lg:hidden">
        <div className="min-w-0 flex-1">
          <ToolRail
            orientation="horizontal"
            tool={tool}
            onToolChange={setTool}
            gridOn={gridOn}
            onToggleGrid={() => setGridOn((v) => !v)}
            mirror={mirror}
            onToggleMirror={() => setMirror((v) => !v)}
            onOpenTemplates={() => setDrawerOpen(true)}
          />
        </div>
        <button
          onClick={() => setPanelOpen(true)}
          className={cn(
            'mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-tag transition-colors',
            panelOpen ? 'bg-yolk/30 text-ink' : 'text-ash hover:bg-sand',
          )}
          aria-label="打开调色盘面板"
        >
          <Layers size={20} />
        </button>
      </div>

      {/* 移动端底部抽屉面板 */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-x-0 bottom-0 z-50 flex h-[72dvh] flex-col overflow-hidden rounded-t-[20px] bg-bead-white shadow-hero-card lg:hidden"
            >
              <button
                onClick={() => setPanelOpen(false)}
                className="mx-auto mt-2 flex h-6 w-16 shrink-0 items-center justify-center rounded-full bg-sand text-ash"
                aria-label="收起面板"
              >
                <ChevronUp size={14} />
              </button>
              <div className="min-h-0 flex-1">
                <SidePanel {...panelProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 模板抽屉 */}
      <TemplateDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        overlay={overlay}
        onOverlay={(tpl) => {
          setOverlay({ tpl, visible: true })
          if (tpl.cols !== size.cols || tpl.rows !== size.rows) setMismatchTpl(tpl)
        }}
        onToggleVisible={() => setOverlay((o) => (o ? { ...o, visible: !o.visible } : o))}
        onRemoveOverlay={() => setOverlay(null)}
        onFill={handleFill}
        cols={size.cols}
        rows={size.rows}
      />

      {/* 导出 Dialog */}
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        name={name}
        cols={size.cols}
        rows={size.rows}
        gridRef={gridRef}
        palette={palette}
        boardWhite={boardWhite}
        shareUrl={shareUrl}
        onDownloadPng={handleDownloadPng}
        onPrintPdf={handlePrintPdf}
        onCopyLink={() => copyText(shareUrl, '分享链接已复制')}
      />

      {/* 清空确认 */}
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent className="rounded-card border-ash/20 bg-bead-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ink">清空画布？</AlertDialogTitle>
            <AlertDialogDescription className="text-ash">
              将移除当前 {total} 颗豆子。此操作可以通过撤销恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="rounded-full bg-cherry text-white hover:bg-[#F05036]">
              清空画布
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 模板尺寸不符 */}
      <AlertDialog open={!!mismatchTpl} onOpenChange={(v) => !v && setMismatchTpl(null)}>
        <AlertDialogContent className="rounded-card border-ash/20 bg-bead-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ink">画布尺寸不符</AlertDialogTitle>
            <AlertDialogDescription className="text-ash">
              模板「{mismatchTpl?.name}」为 {mismatchTpl?.cols}×{mismatchTpl?.rows}，当前画布 {size.cols}×{size.rows}。是否切换画布尺寸？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">保持当前尺寸</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-cherry text-white hover:bg-[#F05036]"
              onClick={() => {
                if (!mismatchTpl) return
                pushHistory()
                gridRef.current = resizeGrid(gridRef.current, size.cols, size.rows, mismatchTpl.cols, mismatchTpl.rows)
                setSize({ cols: mismatchTpl.cols, rows: mismatchTpl.rows })
                bump()
                setMismatchTpl(null)
                showToast(`画布已切换为 ${mismatchTpl.cols}×${mismatchTpl.rows}`)
              }}
            >
              切换画布
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 自定义尺寸 */}
      <Dialog open={customSizeOpen} onOpenChange={setCustomSizeOpen}>
        <DialogContent className="max-w-xs rounded-card border-ash/20 bg-bead-white">
          <DialogHeader>
            <DialogTitle className="text-ink">自定义底板尺寸</DialogTitle>
            <DialogDescription className="text-ash">8 – 80 格之间，已有图案将保留左上角部分。</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <label className="flex-1 text-xs font-bold text-ash">
              宽（列）
              <input
                type="number"
                min={8}
                max={80}
                value={customCols}
                onChange={(e) => setCustomCols(parseInt(e.target.value, 10) || 8)}
                className="mt-1 h-10 w-full rounded-tag border border-ash/30 bg-cream px-3 font-mono text-sm outline-none focus:border-cherry"
              />
            </label>
            <span className="mt-5 text-ash">×</span>
            <label className="flex-1 text-xs font-bold text-ash">
              高（行）
              <input
                type="number"
                min={8}
                max={80}
                value={customRows}
                onChange={(e) => setCustomRows(parseInt(e.target.value, 10) || 8)}
                className="mt-1 h-10 w-full rounded-tag border border-ash/30 bg-cream px-3 font-mono text-sm outline-none focus:border-cherry"
              />
            </label>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                const c = Math.min(80, Math.max(8, customCols))
                const r = Math.min(80, Math.max(8, customRows))
                handleSizeChange(c, r)
                setCustomSizeOpen(false)
                showToast(`画布已调整为 ${c}×${r}`)
              }}
              className="shadow-bead hover:bg-[#F05036] active:shadow-bead-pressed h-10 w-full cursor-pointer rounded-full bg-cherry text-sm font-bold text-white transition-all"
            >
              应用尺寸
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="fixed left-1/2 top-[84px] z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-matcha bg-bead-white px-4 py-2 shadow-card"
          >
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              className="text-matcha"
            >
              <CircleCheck size={16} />
            </motion.span>
            <span className="whitespace-nowrap text-sm font-bold text-ink">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
