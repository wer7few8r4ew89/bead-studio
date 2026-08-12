import { useEffect } from 'react'
import type { ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

gsap.registerPlugin(ScrollTrigger)

/**
 * 全局布局：Navbar(sticky 文档流内) + 内容插槽 + Footer。
 * 使用 children 模式：App.tsx 必须以 <Layout><Routes>…</Routes></Layout> 方式使用。
 * Navbar 为 sticky，内容区无需顶部 offset。
 */
export default function Layout({ children }: { children: ReactNode }) {
  /* Lenis 平滑滚动 + ScrollTrigger 同步 */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.11 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    /* 图片等资源加载完成后刷新 pin 位置 */
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return (
    <div className="flex min-h-[100dvh] flex-col bg-cream">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
