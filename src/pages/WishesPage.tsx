import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Check, Plus, Star, X } from 'lucide-react'

interface Wish {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  completed_date: string | null
  completed_image: string | null
}

export default function WishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const fetchWishes = () => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setWishes(data as Wish[])
        setLoading(false)
      })
  }

  useEffect(() => { fetchWishes() }, [])

  const toggleWish = async (id: string, current: boolean) => {
    if (!isSupabaseConfigured) return
    await supabase
      .from('wishes')
      .update({ is_completed: !current, completed_date: !current ? new Date().toISOString() : null })
      .eq('id', id)
    fetchWishes()
  }

  const addWish = async () => {
    if (!newTitle.trim()) return
    if (!isSupabaseConfigured) { setNewTitle(''); setNewDesc(''); setShowForm(false); return }
    await supabase.from('wishes').insert({ title: newTitle.trim(), description: newDesc.trim() })
    setNewTitle('')
    setNewDesc('')
    setShowForm(false)
    fetchWishes()
  }

  const pendingWishes = wishes.filter((w) => !w.is_completed)
  const completedWishes = wishes.filter((w) => w.is_completed)
  const displayWishes = activeTab === 'pending' ? pendingWishes : completedWishes
  const progress = wishes.length > 0 ? Math.round((completedWishes.length / wishes.length) * 100) : 0

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center text-gray-800 mb-4"
      >
        愿望清单
      </motion.h1>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">共同愿望进度</span>
          <span className="text-sm font-semibold text-rose-500">{completedWishes.length}/{wishes.length} ({progress}%)</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
            transition={{ duration: 1 }}
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'pending' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'
          }`}
        >
          未完成 ({pendingWishes.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'completed' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'
          }`}
        >
          已完成 ({completedWishes.length})
        </button>
      </div>

      {/* Wishes */}
      <div className="space-y-3">
        {displayWishes.map((wish) => (
          <motion.div
            key={wish.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`glass rounded-2xl p-4 flex items-center gap-4 ${
              wish.is_completed ? 'opacity-60' : ''
            }`}
          >
            <button
              onClick={() => toggleWish(wish.id, wish.is_completed)}
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                wish.is_completed
                  ? 'bg-green-400 text-white'
                  : 'border-2 border-gray-300 hover:border-rose-400'
              }`}
            >
              {wish.is_completed && <Check size={16} />}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium ${wish.is_completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                {wish.title}
              </h3>
              {wish.description && (
                <p className="text-sm text-gray-500 truncate">{wish.description}</p>
              )}
              {wish.completed_date && (
                <p className="text-xs text-green-500 mt-1">
                  {new Date(wish.completed_date).toLocaleDateString('zh-CN')} 完成
                </p>
              )}
            </div>
            <Star size={16} className={wish.is_completed ? 'text-amber-400' : 'text-gray-300'} fill="currentColor" />
          </motion.div>
        ))}
        {displayWishes.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            {activeTab === 'pending' ? '还没有愿望，快来添加吧' : '还没有完成的愿望'}
          </p>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-2xl p-4 mt-4">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="愿望标题"
            className="w-full bg-transparent text-gray-700 mb-2 focus:outline-none font-medium"
            autoFocus
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="描述（可选）"
            className="w-full bg-transparent text-sm text-gray-500 mb-3 focus:outline-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
              <X size={16} />
            </button>
            <button onClick={addWish} className="px-4 py-1 text-sm bg-rose-500 text-white rounded-full hover:bg-rose-600">
              添加
            </button>
          </div>
        </motion.div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 mx-auto flex items-center gap-1 text-sm text-rose-400 hover:text-rose-500"
        >
          <Plus size={16} /> 添加愿望
        </button>
      )}
    </div>
  )
}
