import { motion } from 'framer-motion'
import CountdownTimer from './CountdownTimer'

export default function HeroSection() {
  // Default values — users can customize these
  const sinceDate = new Date('2023-06-03')
  const partner1 = '宝宝'
  const partner2 = '贝贝'

  return (
    <section className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="relative z-10">
        <CountdownTimer
          sinceDate={sinceDate}
          partner1={partner1}
          partner2={partner2}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-400 text-sm mb-4">向下滚动探索更多回忆</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-rose-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
