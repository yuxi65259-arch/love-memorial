import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Festival {
  date: { month: number; day: number }
  emoji: string
  message: string
}

const festivals: Festival[] = [
  { date: { month: 2, day: 14 }, emoji: '🌹', message: '情人节快乐！' },
  { date: { month: 3, day: 8 }, emoji: '🌸', message: '女神节快乐！' },
  { date: { month: 5, day: 20 }, emoji: '💕', message: '520快乐！' },
  { date: { month: 5, day: 21 }, emoji: '💝', message: '521快乐！' },
  { date: { month: 7, day: 7 }, emoji: '✨', message: '七夕快乐！' },
  { date: { month: 12, day: 25 }, emoji: '🎄', message: '圣诞快乐！' },
  { date: { month: 1, day: 1 }, emoji: '🎉', message: '新年快乐！' },
  { date: { month: 12, day: 31 }, emoji: '🎆', message: '跨年夜快乐！' },
]

interface Birthday {
  month: number
  day: number
  name: string
}

const birthdays: Birthday[] = [
  { month: 6, day: 15, name: '宝宝' },
  { month: 9, day: 20, name: '贝贝' },
]

export function useFestivalTheme() {
  const [festival, setFestival] = useState<Festival | null>(null)
  const [birthday, setBirthday] = useState<Birthday | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()

    const foundFestival = festivals.find((f) => f.date.month === month && f.date.day === day)
    const foundBirthday = birthdays.find((b) => b.month === month && b.day === day)

    if (foundFestival || foundBirthday) {
      setFestival(foundFestival || null)
      setBirthday(foundBirthday || null)
      setTimeout(() => setShowBanner(true), 500)
    }
  }, [])

  return { festival, birthday, showBanner, setShowBanner }
}

export function FestivalBanner({
  festival,
  birthday,
  showBanner,
  onClose,
}: {
  festival: Festival | null
  birthday: Birthday | null
  showBanner: boolean
  onClose: () => void
}) {
  if (!showBanner) return null

  const message = birthday
    ? `🎂 ${birthday.name}生日快乐！🎂`
    : festival
    ? `${festival.emoji} ${festival.message}`
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
        <span className="text-2xl">{birthday ? '🎂' : festival?.emoji}</span>
        <span className="font-semibold whitespace-nowrap">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/70 hover:text-white text-sm">
          ✕
        </button>
      </div>
    </motion.div>
  )
}
