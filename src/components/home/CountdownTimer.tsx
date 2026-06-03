import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'

interface Props {
  sinceDate: Date
  partner1: string
  partner2: string
}

function FlipCard({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      <div className="glass-rose rounded-xl px-4 py-3 min-w-[72px] text-center">
        <span className="text-2xl font-bold text-rose-600 tabular-nums">{value}</span>
      </div>
      <span className="text-xs text-gray-500 mt-2">{label}</span>
    </motion.div>
  )
}

export default function CountdownTimer({ sinceDate, partner1, partner2 }: Props) {
  const elapsed = useCountdown(sinceDate)

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-2">
          {partner1} <span className="text-rose-400">&</span> {partner2}
        </h1>
        <p className="text-gray-500 text-lg flex items-center justify-center gap-1">
          <Heart size={16} className="text-rose-400 animate-heartbeat" fill="currentColor" />
          在一起的每一天
          <Heart size={16} className="text-rose-400 animate-heartbeat" fill="currentColor" />
        </p>
      </motion.div>

      <div className="flex gap-3 md:gap-6 mb-10 flex-wrap justify-center">
        <FlipCard value={String(elapsed.years)} label="年" />
        <FlipCard value={String(elapsed.months)} label="月" />
        <FlipCard value={String(elapsed.days)} label="天" />
        <FlipCard value={String(elapsed.hours).padStart(2, '0')} label="时" />
        <FlipCard value={String(elapsed.minutes).padStart(2, '0')} label="分" />
        <FlipCard value={String(elapsed.seconds).padStart(2, '0')} label="秒" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl px-8 py-6 max-w-sm w-full text-center"
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-rose-500 tabular-nums">
              {elapsed.totalDays.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">总共天数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-500 tabular-nums">
              {elapsed.totalHours.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">总共小时</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-500 tabular-nums">
              {elapsed.totalHeartbeats.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">次心跳</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
