import HeroSection from '@/components/home/HeroSection'
import ProcessSection from '@/components/home/ProcessSection'
import PatternPicks from '@/components/home/PatternPicks'
import ColorFamilies from '@/components/home/ColorFamilies'
import WhySection from '@/components/home/WhySection'
import CommunityCta from '@/components/home/CommunityCta'

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProcessSection />
      <PatternPicks />
      <ColorFamilies />
      <WhySection />
      <CommunityCta />
    </>
  )
}
