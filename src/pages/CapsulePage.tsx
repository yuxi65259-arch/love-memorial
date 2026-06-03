import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import { Timer, Lock, Unlock, Plus, Calendar, Eye } from 'lucide-react'

interface Capsule {
  id: string
  author: string
  title: string
  message: string
  image_url: string | null
  unlock_at: string
  is_unlocked: boolean
  created_at: string
}

export default function CapsulePage() {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Capsule | null>(null)
  const [form, setForm] = useState({ author: '', title: '', message: '', unlock_at: '' })

  const fetchCapsules = () => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    supabase
      .from('time_capsules')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const updated = (data as Capsule[]).map((c) => ({
            ...c,
            is_unlocked: c.is_unlocked || new Date(c.unlock_at) <= new Date(),
          }))
          setCapsules(updated)
        }
        setLoading(false)
      })
  }

  useEffect(() => { fetchCapsules() }, [])

  const createCapsule = async () => {
    if (!form.title || !form.message || !form.unlock_at || !form.author) return
    if (!isSupabaseConfigured) { setForm({ author: '', title: '', message: '', unlock_at: '' }); setShowForm(false); return }
    await supabase.from('time_capsules').insert({
      author: form.author,
      title: form.title,
      message: form.message,
      unlock_at: form.unlock_at,
    })
    setForm({ author: '', title: '', message: '', unlock_at: '' })
    setShowForm(false)
    fetchCapsules()
  }

  const viewCapsule = async (capsule: Capsule) => {
    if (!capsule.is_unlocked) {
      if (isSupabaseConfigured) {
        await supabase.from('time_capsules').update({ is_unlocked: true }).eq('id', capsule.id)
      }
    }
    setSelected(capsule)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center text-gray-800 mb-2"
      >
        未来时间胶囊
      </motion.h1>
      <p className="text-center text-gray-400 text-sm mb-8">写下给未来的你/TA的信，等到那一天再打开</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capsules.map((capsule) => (
          <motion.div
            key={capsule.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass rounded-2xl p-5 relative overflow-hidden ${
              capsule.is_unlocked ? 'border-green-200' : 'border-amber-200'
            } border-2`}
          >
            {capsule.is_unlocked ? (
              <div className="absolute top-3 right-3">
                <Unlock size={16} className="text-green-400" />
              </div>
            ) : (
              <div className="absolute top-3 right-3">
                <Lock size={16} className="text-amber-400" />
              </div>
            )}

            <h3 className="font-semibold text-gray-800 mb-1 pr-6">{capsule.title}</h3>
            <p className="text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> 解锁日期: {new Date(capsule.unlock_at).toLocaleDateString('zh-CN')}
              </span>
            </p>
            <p className="text-xs text-gray-400">来自: {capsule.author}</p>
            <p className="text-xs text-gray-400">{new Date(capsule.created_at).toLocaleDateString('zh-CN')} 封存</p>

            {capsule.is_unlocked && !selected && (
              <button
                onClick={() => viewCapsule(capsule)}
                className="mt-3 flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600"
              >
                <Eye size={14} /> 查看内容
              </button>
            )}

            {!capsule.is_unlocked && (
              <div className="mt-3 text-sm text-amber-500 flex items-center gap-1">
                <Timer size={14} /> 尚未解锁
              </div>
            )}
          </motion.div>
        ))}
        {capsules.length === 0 && (
          <p className="text-gray-400 text-center col-span-full py-8">还没有时间胶囊，创建第一个吧</p>
        )}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="mt-6 mx-auto flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-medium transition-colors"
      >
        <Plus size={18} /> 创建时间胶囊
      </button>

      {/* Create form modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="创建时间胶囊">
        <div className="space-y-4">
          <input
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="你的名字"
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="胶囊标题"
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="写给未来的话..."
            rows={4}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:outline-none resize-none"
          />
          <div>
            <label className="text-sm text-gray-500 mb-1 block">解锁日期</label>
            <input
              type="date"
              value={form.unlock_at}
              onChange={(e) => setForm({ ...form, unlock_at: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>
          <button
            onClick={createCapsule}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors"
          >
            封存胶囊
          </button>
        </div>
      </Modal>

      {/* View capsule modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>来自: <strong>{selected.author}</strong></span>
              <span>封存于: {new Date(selected.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="bg-rose-50 rounded-2xl p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
