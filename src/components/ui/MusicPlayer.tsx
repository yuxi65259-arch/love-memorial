import { useState } from 'react'
import { motion } from 'framer-motion'
import { VolumeX, Music } from 'lucide-react'

interface Props {
  src?: string
}

export default function MusicPlayer({ src }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio] = useState(() => {
    if (!src) return null
    const a = new Audio(src)
    a.loop = true
    a.volume = 0.3
    return a
  })

  const toggle = () => {
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  if (!src) return null

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 glass rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
      title={isPlaying ? '暂停音乐' : '播放音乐'}
    >
      {isPlaying ? (
        <Music size={20} className="text-rose-500 animate-pulse" />
      ) : (
        <VolumeX size={20} className="text-gray-400" />
      )}
    </motion.button>
  )
}
