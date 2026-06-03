import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Send, ImageIcon, Mic, Heart, Lock, Clock } from 'lucide-react'

interface Message {
  id: string
  author: string
  content: string
  image_url: string | null
  audio_url: string | null
  is_love_letter: boolean
  reveal_at: string | null
  created_at: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [activeTab, setActiveTab] = useState<'messages' | 'letters'>('messages')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = () => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setMessages(data as Message[])
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchMessages()

    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMessages()
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!content.trim() || !author.trim()) return
    if (!isSupabaseConfigured) { setContent(''); return }
    await supabase.from('messages').insert({ author, content: content.trim(), is_love_letter: activeTab === 'letters' })
    setContent('')
    fetchMessages()
  }

  const filteredMessages = activeTab === 'messages'
    ? messages.filter((m) => !m.is_love_letter || (m.reveal_at && new Date(m.reveal_at) <= new Date()))
    : messages.filter((m) => m.is_love_letter)

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col min-h-[calc(100vh-7rem)]">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center text-gray-800 mb-8"
      >
        留言板
      </motion.h1>

      {/* Tabs */}
      <div className="flex gap-2 justify-center mb-6">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'messages' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'
          }`}
        >
          留言
        </button>
        <button
          onClick={() => setActiveTab('letters')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'letters' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'
          }`}
        >
          情书墙
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2">
        <AnimatePresence>
          {filteredMessages.map((msg) => {
            const isLocked = msg.reveal_at && new Date(msg.reveal_at) > new Date()
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass rounded-2xl p-4 ${msg.is_love_letter ? 'border-l-4 border-rose-400' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-rose-600 text-sm">{msg.author}</span>
                  <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString('zh-CN')}</span>
                  {msg.is_love_letter && <Heart size={14} className="text-rose-400" fill="currentColor" />}
                  {isLocked && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      <Lock size={12} />
                      <Clock size={12} />
                      {new Date(msg.reveal_at!).toLocaleDateString('zh-CN')} 开启
                    </span>
                  )}
                </div>
                {isLocked ? (
                  <p className="text-gray-400 italic">这封情书将在指定时间开启...</p>
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.image_url && !isLocked && (
                  <img src={msg.image_url} alt="" className="mt-3 rounded-xl max-h-48 object-cover" />
                )}
              </motion.div>
            )
          })}
          {filteredMessages.length === 0 && (
            <p className="text-center text-gray-400 py-8">还没有留言，写下第一句话吧</p>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass rounded-2xl p-4">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="你的名字"
          className="w-full bg-transparent text-sm text-gray-600 mb-2 focus:outline-none"
        />
        <div className="flex gap-2 items-end">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={activeTab === 'letters' ? '写一封情书...' : '说点什么...'}
            rows={2}
            className="flex-1 bg-transparent resize-none focus:outline-none text-gray-700 placeholder-gray-400"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          />
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:text-rose-400 transition-colors">
              <ImageIcon size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-rose-400 transition-colors">
              <Mic size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={!content.trim() || !author.trim()}
              className="p-2 text-rose-500 hover:text-rose-600 disabled:text-gray-300 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
