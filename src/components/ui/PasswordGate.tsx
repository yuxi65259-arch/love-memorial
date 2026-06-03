import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface Props {
  password: string
  hint?: string
  onUnlock: () => void
}

export default function PasswordGate({ password, hint, onUnlock }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === password) {
      setError(false)
      onUnlock()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-cream to-rose-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-rose p-8 rounded-2xl max-w-sm w-full mx-4"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-rose-500 mb-4"
          >
            <Lock size={48} className="mx-auto" />
          </motion.div>
          <h2 className="text-xl font-semibold text-rose-700 mb-2">专属回忆</h2>
          <p className="text-gray-500 text-sm">请输入密码解锁我们的故事</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showHint ? 'text' : 'password'}
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false) }}
              placeholder="输入密码..."
              className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-rose-400 text-center text-lg tracking-widest"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showHint ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              密码不对哦，再试试
            </motion.p>
          )}

          {hint && (
            <p className="text-gray-400 text-xs text-center cursor-pointer hover:text-gray-500" onClick={() => setShowHint(!showHint)}>
              提示: {hint}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors"
          >
            解锁回忆
          </button>
        </form>
      </motion.div>
    </div>
  )
}
