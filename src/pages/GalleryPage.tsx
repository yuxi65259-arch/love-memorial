import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { MapPin, Calendar, Camera, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: string
  url: string
  thumbnail_url: string | null
  title: string | null
  location: string | null
  taken_date: string | null
  album: string | null
}

const albums = [
  { key: 'all', label: '全部' },
  { key: 'first_trip', label: '第一次旅行' },
  { key: 'daily', label: '日常碎片' },
  { key: 'surprise', label: '节日惊喜' },
  { key: 'special', label: '特别时刻' },
]

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAlbum, setActiveAlbum] = useState('all')
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [dailyPhoto, setDailyPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    supabase
      .from('photos')
      .select('*')
      .order('taken_date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPhotos(data as Photo[])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (photos.length > 0) {
      const today = new Date().toDateString()
      const stored = localStorage.getItem('dailyPhoto')
      if (stored) {
        const { date, photoId } = JSON.parse(stored)
        if (date === today) {
          const found = photos.find((p) => p.id === photoId)
          if (found) { setDailyPhoto(found); return }
        }
      }
      const random = photos[Math.floor(Math.random() * photos.length)]
      setDailyPhoto(random)
      localStorage.setItem('dailyPhoto', JSON.stringify({ date: today, photoId: random.id }))
    }
  }, [photos])

  const filteredPhotos = activeAlbum === 'all'
    ? photos
    : photos.filter((p) => p.album === activeAlbum)

  const selectedPhoto = selectedIdx !== null ? filteredPhotos[selectedIdx] : null

  const goPrev = () => {
    if (selectedIdx !== null && selectedIdx > 0) setSelectedIdx(selectedIdx - 1)
  }

  const goNext = () => {
    if (selectedIdx !== null && selectedIdx < filteredPhotos.length - 1) setSelectedIdx(selectedIdx + 1)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center text-gray-800 mb-4"
      >
        我们的照片墙
      </motion.h1>

      {/* Album tabs */}
      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        {albums.map((a) => (
          <button
            key={a.key}
            onClick={() => setActiveAlbum(a.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeAlbum === a.key
                ? 'bg-rose-500 text-white'
                : 'bg-white text-gray-600 hover:bg-rose-50'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Daily photo */}
      {dailyPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-4 mb-8 flex gap-4 items-center"
        >
          <Camera size={20} className="text-rose-400 shrink-0" />
          <span className="text-sm text-gray-500">今日回忆:</span>
          <img
            src={dailyPhoto.thumbnail_url || dailyPhoto.url}
            alt=""
            className="w-16 h-16 rounded-xl object-cover cursor-pointer"
            onClick={() => {
              const idx = filteredPhotos.findIndex((p) => p.id === dailyPhoto.id)
              if (idx >= 0) setSelectedIdx(idx)
            }}
          />
          <div>
            <p className="text-sm font-medium text-gray-700">{dailyPhoto.title || '美好瞬间'}</p>
            {dailyPhoto.taken_date && (
              <p className="text-xs text-gray-400">{new Date(dailyPhoto.taken_date).toLocaleDateString('zh-CN')}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {filteredPhotos.length === 0 && (
          <p className="text-gray-400 text-center col-span-full py-12">还没有照片，快去上传吧</p>
        )}
        {filteredPhotos.map((photo, idx) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (idx % 8) * 0.05 }}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => setSelectedIdx(idx)}
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={photo.thumbnail_url || photo.url}
                alt={photo.title || ''}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="text-white text-sm">
                  {photo.title && <p className="font-medium">{photo.title}</p>}
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    {photo.taken_date && (
                      <span className="flex items-center gap-0.5"><Calendar size={10} />{new Date(photo.taken_date).toLocaleDateString('zh-CN')}</span>
                    )}
                    {photo.location && (
                      <span className="flex items-center gap-0.5"><MapPin size={10} />{photo.location}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Photo viewer */}
      <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedIdx(null)}>
        {selectedPhoto && (
          <div className="flex flex-col items-center">
            <div className="relative w-full flex items-center justify-center gap-4">
              <button
                onClick={goPrev}
                disabled={selectedIdx === 0}
                className="p-2 rounded-full bg-white/80 hover:bg-white disabled:opacity-30 transition-opacity"
              >
                <ChevronLeft size={20} />
              </button>
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title || ''}
                className="max-h-[60vh] rounded-xl object-contain"
              />
              <button
                onClick={goNext}
                disabled={selectedIdx === filteredPhotos.length - 1}
                className="p-2 rounded-full bg-white/80 hover:bg-white disabled:opacity-30 transition-opacity"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="mt-4 text-center">
              {selectedPhoto.title && <h3 className="font-semibold text-gray-800">{selectedPhoto.title}</h3>}
              <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mt-1">
                {selectedPhoto.taken_date && (
                  <span className="flex items-center gap-1"><Calendar size={12} />{new Date(selectedPhoto.taken_date).toLocaleDateString('zh-CN')}</span>
                )}
                {selectedPhoto.location && (
                  <span className="flex items-center gap-1"><MapPin size={12} />{selectedPhoto.location}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
