import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Calendar, Heart } from 'lucide-react'

interface Milestone {
  id: string
  title: string
  description: string
  date: string
  category: string
  cover_image: string | null
  images: string[] | null
}

const categoryIcons: Record<string, string> = {
  first_met: '👋',
  confession: '💌',
  first_date: '🌹',
  first_trip: '✈️',
  anniversary: '🎉',
  special: '✨',
  other: '💝',
}

const categoryLabels: Record<string, string> = {
  first_met: '初次相遇',
  confession: '表白',
  first_date: '第一次约会',
  first_trip: '第一次旅行',
  anniversary: '纪念日',
  special: '特别时刻',
  other: '其他',
}

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Milestone | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    supabase
      .from('milestones')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setMilestones(data as Milestone[])
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingSpinner />

  // Fallback demo data
  const displayMilestones = milestones.length > 0 ? milestones : [
    { id: '1', title: '初次相遇', description: '在茫茫人海中遇见你，是我最美丽的意外', date: '2023-06-03', category: 'first_met', cover_image: null, images: null },
    { id: '2', title: '第一次约会', description: '那天阳光很好，你也是', date: '2023-06-15', category: 'first_date', cover_image: null, images: null },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center text-gray-800 mb-12"
      >
        我们的时间轴
      </motion.h1>

      <div className="relative">
        {/* Tree trunk line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-300 via-rose-200 to-rose-100 -translate-x-1/2" />

        {displayMilestones.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '100px' }}
            transition={{ delay: i * 0.1 }}
            className={`relative flex items-center mb-12 ${
              i % 2 === 0 ? 'justify-start pr-[50%]' : 'justify-end pl-[50%]'
            }`}
          >
            {/* Node dot */}
            <div className="absolute left-1/2 -translate-x-1/2 z-10">
              <motion.button
                whileHover={{ scale: 1.2 }}
                onClick={() => setSelected(m as Milestone)}
                className="w-10 h-10 bg-rose-400 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-500 transition-colors text-lg"
              >
                {categoryIcons[m.category] || '💝'}
              </motion.button>
            </div>

            {/* Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelected(m as Milestone)}
              className={`glass-rose rounded-xl p-4 cursor-pointer max-w-[85%] ${
                i % 2 === 0 ? 'mr-8' : 'ml-8'
              }`}
            >
              <div className="flex items-center gap-2 text-xs text-rose-400 mb-1">
                <Calendar size={12} />
                <span>{new Date(m.date).toLocaleDateString('zh-CN')}</span>
                <span className="text-gray-400">·</span>
                <span>{categoryLabels[m.category] || m.category}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{m.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{m.description}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div className="space-y-4">
            {selected.cover_image && (
              <img src={selected.cover_image} alt={selected.title} className="w-full rounded-xl object-cover max-h-80" />
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={14} />{new Date(selected.date).toLocaleDateString('zh-CN')}</span>
              <span className="flex items-center gap-1"><Heart size={14} className="text-rose-400" />{categoryLabels[selected.category]}</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{selected.description}</p>
            {selected.images && selected.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {selected.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="rounded-lg object-cover w-full h-40" />
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
