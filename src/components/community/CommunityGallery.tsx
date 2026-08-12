import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Heart, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CommunityPatternItem } from '@/lib/community'
import { loadLikedIds, markLiked } from '@/lib/community'
import { trpc } from '@/providers/trpc'
import BeadButton from '@/components/BeadButton'
import CommunityDetailDialog from '@/components/community/CommunityDetailDialog'

type Sort = 'new' | 'popular'
const PAGE_SIZE = 12

/** 豆子 loading：三颗小豆跳动 */
function BeadLoading({ label = '社区作品加载中…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20" role="status">
      <div className="flex gap-2">
        {['#E8452C', '#FFC93C', '#58A05C'].map((c, i) => (
          <motion.span
            key={c}
            className="bead-ball h-4 w-4"
            style={{ backgroundColor: c }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          />
        ))}
      </div>
      <p className="text-xs text-ash">{label}</p>
    </div>
  )
}

/** 骨架卡片 */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-card bg-bead-white shadow-card">
      <div className="bg-pegboard aspect-square w-full animate-pulse bg-sand" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-sand" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-sand" />
      </div>
    </div>
  )
}

function CommunityCard({
  item,
  liked,
  onLike,
  onPreview,
}: {
  item: CommunityPatternItem
  liked: boolean
  onLike: (id: number) => void
  onPreview: (item: CommunityPatternItem) => void
}) {
  return (
    <motion.article
      layout="position"
      initial={{ y: -24, scale: 0.6, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-card bg-bead-white shadow-card transition-shadow duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:outline hover:outline-2 hover:outline-yolk"
    >
      <button
        type="button"
        onClick={() => onPreview(item)}
        className="bg-pegboard relative block w-full cursor-pointer bg-bead-white p-5"
        aria-label={`查看社区作品 ${item.name}`}
      >
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={`拼豆作品：${item.name}`}
            loading="lazy"
            className="aspect-square w-full rounded-tag object-cover transition-all [transition-duration:400ms] [filter:blur(2px)_contrast(1.1)] group-hover:[filter:none]"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-tag bg-sand font-pixel text-[10px] text-ash pixel-shadow">
            NO IMAGE
          </div>
        )}
        <span className="pointer-events-none absolute inset-x-5 bottom-5 flex translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="pointer-events-auto inline-flex h-9 flex-1 items-center justify-center rounded-full border-2 border-ink/70 bg-bead-white/90 text-sm font-bold text-ink transition-colors hover:border-cherry hover:text-cherry">
            查看详情
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-lg font-bold leading-snug">{item.name}</h3>
          <button
            type="button"
            onClick={() => !liked && onLike(item.id)}
            disabled={liked}
            aria-label={liked ? '已点赞' : `给 ${item.name} 点赞`}
            className={cn(
              'flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all',
              liked ? 'bg-cherry/10 text-cherry' : 'bg-sand text-ash hover:bg-cherry/10 hover:text-cherry',
            )}
          >
            <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
            {item.likes + (liked ? 1 : 0)}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate font-mono text-xs text-ash">
            {item.cols}×{item.rows} · {item.beadCount} 豆
          </p>
          <p className="shrink-0 text-[11px] text-ash">by {item.author}</p>
        </div>
      </div>
    </motion.article>
  )
}

/** 社区作品画廊：最新/最热切换 + 游标分页 + 点赞（本地防重复） */
export default function CommunityGallery() {
  const [sort, setSort] = useState<Sort>('new')
  const [preview, setPreview] = useState<CommunityPatternItem | null>(null)
  const [likedIds, setLikedIds] = useState<Set<number>>(() => loadLikedIds())

  const query = trpc.patterns.list.useInfiniteQuery(
    { limit: PAGE_SIZE, sort },
    { getNextPageParam: (last) => last.nextCursor ?? undefined },
  )
  const like = trpc.patterns.like.useMutation()

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data])

  const handleLike = (id: number) => {
    if (likedIds.has(id) || like.isPending) return
    const next = new Set(likedIds)
    markLiked(next, id)
    setLikedIds(next)
    like.mutate({ id })
  }

  const sortBtn = (id: Sort, label: string, icon: React.ReactNode) => (
    <button
      key={id}
      onClick={() => setSort(id)}
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all',
        sort === id
          ? 'shadow-bead active:shadow-bead-pressed border-cherry bg-cherry text-white'
          : 'border-ink/20 bg-bead-white text-ink hover:border-cherry hover:text-cherry',
      )}
    >
      {icon} {label}
    </button>
  )

  return (
    <div>
      {/* 排序切换 */}
      <div className="flex flex-wrap items-center gap-2 pb-6">
        {sortBtn('new', '最新', <Sparkles size={14} />)}
        {sortBtn('popular', '最热', <Flame size={14} />)}
      </div>

      {query.isPending ? (
        <div>
          <BeadLoading />
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="font-pixel text-xs text-ash pixel-shadow">NETWORK ERROR</p>
          <p className="text-ink/70">社区作品加载失败，检查网络后重试。</p>
          <BeadButton variant="ghost" size="sm" onClick={() => query.refetch()}>
            <RefreshCw size={14} /> 重新加载
          </BeadButton>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="font-pixel text-xs text-ash pixel-shadow">BE THE FIRST</p>
          <p className="max-w-sm text-ink/70">
            社区还没有作品。去创作工坊拼一幅，在导出面板点击「上传到模板库」，成为第一个分享的豆友吧！
          </p>
          <BeadButton to="/studio" variant="cherry" size="sm">
            去创作 →
          </BeadButton>
        </div>
      ) : (
        <>
          <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((it) => (
                <CommunityCard
                  key={it.id}
                  item={it}
                  liked={likedIds.has(it.id)}
                  onLike={handleLike}
                  onPreview={setPreview}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {query.hasNextPage && (
            <div className="mt-12 flex justify-center">
              <BeadButton
                variant="yolk"
                onClick={() => query.fetchNextPage()}
                className={cn(query.isFetchingNextPage && 'opacity-70')}
              >
                {query.isFetchingNextPage ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> 加载中…
                  </>
                ) : (
                  '加载更多社区作品'
                )}
              </BeadButton>
            </div>
          )}
        </>
      )}

      <CommunityDetailDialog
        pattern={preview}
        liked={preview ? likedIds.has(preview.id) : false}
        onLike={handleLike}
        onClose={() => setPreview(null)}
      />
    </div>
  )
}
