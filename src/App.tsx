import { Routes, Route, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Studio from '@/pages/Studio'
import Patterns from '@/pages/Patterns'
import Colors from '@/pages/Colors'
import Guide from '@/pages/Guide'

export default function App() {
  const location = useLocation()
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/patterns" element={<Patterns />} />
            <Route path="/colors" element={<Colors />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
