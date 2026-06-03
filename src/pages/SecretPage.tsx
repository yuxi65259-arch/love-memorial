import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import PasswordGate from '@/components/ui/PasswordGate'
import { Heart, Camera, Lock } from 'lucide-react'

export default function SecretPage() {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('secret_unlocked') === 'true'
  })
  const [secretContent, setSecretContent] = useState<string>('')

  const handleUnlock = useCallback(() => {
    sessionStorage.setItem('secret_unlocked', 'true')
    setAuthenticated(true)
  }, [])

  useEffect(() => {
    if (authenticated && isSupabaseConfigured) {
      supabase
        .from('settings')
        .select('value')
        .eq('key', 'secret_page_content')
        .single()
        .then(({ data }) => {
          if (data) {
            setSecretContent((data.value as { content: string }).content || '')
          }
        })
    }
  }, [authenticated])

  if (!authenticated) {
    return (
      <PasswordGate
        password="ourlove"
        hint="我们的纪念日（格式: YYYYMMDD）"
        onUnlock={handleUnlock}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-cream to-rose-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-rose-500 mb-4"
          >
            <Lock size={40} className="mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">我们的秘密花园</h1>
          <p className="text-gray-500">只有我们知道的地方</p>
        </div>

        {secretContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-rose rounded-2xl p-8 mb-8"
          >
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{secretContent}</p>
          </motion.div>
        )}

        {/* Photo upload hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <Camera size={32} className="text-rose-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm mb-4">这里可以放更多属于我们的私人照片和故事</p>
          <button className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-sm transition-colors">
            上传照片
          </button>
        </motion.div>

        {/* Love note prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <textarea
            placeholder="写下只想告诉TA的秘密..."
            className="w-full max-w-md p-4 rounded-2xl glass-rose resize-none h-32 focus:outline-none text-gray-700"
          />
          <button className="mt-3 px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-sm transition-colors flex items-center gap-2 mx-auto">
            <Heart size={14} fill="currentColor" /> 保存秘密
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
