import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Award, Check, Flame, Star, Heart, Coffee, Utensils, Music, Film, Plane, Sun, Moon } from 'lucide-react'

interface CheckIn {
  id: string
  task_title: string
  task_description: string | null
  completed_by: string | null
  completed_at: string
  badge_icon: string | null
}

const presetTasks = [
  { title: '一起做饭', icon: 'Utensils', description: '一起做一顿美味晚餐' },
  { title: '一起看电影', icon: 'Film', description: '窝在沙发看一部电影' },
  { title: '说早安', icon: 'Sun', description: '醒来第一件事就是说早安' },
  { title: '说晚安', icon: 'Moon', description: '睡前互道晚安' },
  { title: '拥抱10秒', icon: 'Heart', description: '深深拥抱10秒钟' },
  { title: '一起喝咖啡', icon: 'Coffee', description: '享受悠闲的咖啡时光' },
  { title: '一起散步', icon: 'Footprints', description: '牵手散步聊聊天' },
  { title: '听一首歌', icon: 'Music', description: '共享一首喜欢的歌' },
  { title: '一起旅行', icon: 'Plane', description: '去一个没去过的地方' },
  { title: '拍合照', icon: 'Camera', description: '定格今天的美好' },
]

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Utensils, Film, Sun, Moon, Heart, Coffee, Music, Plane,
  Footprints: () => <span className="text-lg">👣</span>,
  Camera: () => <span className="text-lg">📷</span>,
}

const badgeColors = ['bg-rose-400', 'bg-amber-400', 'bg-sky-400', 'bg-emerald-400', 'bg-violet-400', 'bg-pink-400']

export default function CheckInPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [completedAnim, setCompletedAnim] = useState<string | null>(null)

  const fetchCheckins = () => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    supabase
      .from('checkins')
      .select('*')
      .order('completed_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setCheckins(data as CheckIn[])
        setLoading(false)
      })
  }

  useEffect(() => { fetchCheckins() }, [])

  const doCheckIn = async (task: typeof presetTasks[0]) => {
    if (!isSupabaseConfigured) { setCompletedAnim(task.title); setTimeout(() => setCompletedAnim(null), 2000); return }
    const badge = badgeColors[Math.floor(Math.random() * badgeColors.length)]
    await supabase.from('checkins').insert({
      task_title: task.title,
      task_description: task.description,
      completed_by: 'me',
      badge_icon: badge,
    })
    setCompletedAnim(task.title)
    setTimeout(() => setCompletedAnim(null), 2000)
    fetchCheckins()
  }

  const today = new Date().toDateString()
  const todayCheckins = checkins.filter((c) => new Date(c.completed_at).toDateString() === today)
  const streak = calculateStreak(checkins)

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center text-gray-800 mb-6"
      >
        恋爱打卡
      </motion.h1>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 text-center">
          <Flame size={24} className="text-orange-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800">{streak}</div>
          <div className="text-xs text-gray-500">连续打卡</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-4 text-center">
          <Check size={24} className="text-green-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800">{todayCheckins.length}</div>
          <div className="text-xs text-gray-500">今日打卡</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-4 text-center">
          <Award size={24} className="text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800">{checkins.length}</div>
          <div className="text-xs text-gray-500">总打卡</div>
        </motion.div>
      </div>

      {/* Task list */}
      <div className="space-y-3 mb-8">
        {presetTasks.map((task) => {
          const todayDone = todayCheckins.some((c) => c.task_title === task.title)
          const IconComp = iconMap[task.icon] || Star
          return (
            <motion.div
              key={task.title}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => !todayDone && doCheckIn(task)}
              className={`glass rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                todayDone ? 'opacity-50' : 'hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                todayDone ? 'bg-green-100' : 'bg-rose-50'
              }`}>
                {todayDone ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <IconComp size={20} className="text-rose-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800">{task.title}</h3>
                <p className="text-sm text-gray-500 truncate">{task.description}</p>
              </div>
              {todayDone && <span className="text-xs text-green-500 font-medium">已完成</span>}
            </motion.div>
          )
        })}
      </div>

      {/* Badge collection */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Award size={18} className="text-amber-400" /> 徽章收集
      </h2>
      <div className="flex flex-wrap gap-3">
        {checkins.length === 0 && (
          <p className="text-gray-400 text-sm">完成打卡获得徽章</p>
        )}
        {[...new Set(checkins.map((c) => c.badge_icon))].map((badge, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-10 h-10 ${badge} rounded-full flex items-center justify-center text-white shadow-lg`}
          >
            <Star size={16} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      {/* Completion toast */}
      {completedAnim && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-3 z-50"
        >
          <Award size={20} className="text-amber-400" /> 完成了 '{completedAnim}'！
        </motion.div>
      )}
    </div>
  )
}

function calculateStreak(checkins: CheckIn[]): number {
  if (checkins.length === 0) return 0
  const dates = [...new Set(checkins.map((c) => new Date(c.completed_at).toDateString()))].sort().reverse()
  let streak = 0
  const today = new Date()
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    if (dates[i] === expected.toDateString()) {
      streak++
    } else {
      break
    }
  }
  return streak
}
