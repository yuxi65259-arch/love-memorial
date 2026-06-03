import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { FileSignature, Pen, Check, User } from 'lucide-react'

interface Contract {
  id: string
  title: string
  content: string
  signed_by_partner1: boolean
  signed_by_partner2: boolean
  signature1: string | null
  signature2: string | null
}

const defaultContracts = [
  {
    title: '我们的约定',
    content: `1. 吵架不隔夜，当天的问题当天解决
2. 每天睡前互道晚安
3. 记住每一个重要的日子
4. 互相尊重，永远不欺骗
5. 做彼此最好的朋友和最坚实的依靠
6. 一起成长，一起变得更好
7. 无论发生什么，握紧彼此的手`,
  },
]

export default function ContractPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState<string | null>(null)
  const [signPartner, setSignPartner] = useState<'partner1' | 'partner2'>('partner1')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    supabase
      .from('love_contracts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setContracts(data as Contract[])
        setLoading(false)
      })
  }, [])

  const startSigning = (contractId: string, partner: 'partner1' | 'partner2') => {
    setSigning(contractId)
    setSignPartner(partner)
    setTimeout(() => {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.strokeStyle = '#e11d48'
          ctx.lineWidth = 2
          ctx.lineCap = 'round'
        }
      }
    }, 100)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const rect = canvas.getBoundingClientRect()
        ctx.beginPath()
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const rect = canvas.getBoundingClientRect()
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.stroke()
      }
    }
  }

  const handleMouseUp = () => setIsDrawing(false)

  const saveSignature = async (contractId: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()
    const field = signPartner === 'partner1' ? 'signature1' : 'signature2'
    const signedField = signPartner === 'partner1' ? 'signed_by_partner1' : 'signed_by_partner2'
    await supabase.from('love_contracts').update({ [field]: dataUrl, [signedField]: true }).eq('id', contractId)
    setSigning(null)
    const { data } = await supabase.from('love_contracts').select('*').order('created_at', { ascending: false })
    if (data) setContracts(data as Contract[])
  }

  if (loading) return <LoadingSpinner />

  const displayContracts = contracts.length > 0 ? contracts : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center text-gray-800 mb-8"
      >
        爱情契约
      </motion.h1>

      {displayContracts.length === 0 && (
        <>
          {defaultContracts.map((contract, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-rose rounded-2xl p-8 mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <FileSignature size={24} className="text-rose-500" />
                <h2 className="text-xl font-semibold text-gray-800">{contract.title}</h2>
              </div>
              <div className="bg-white/60 rounded-xl p-6 whitespace-pre-wrap text-gray-700 leading-relaxed">
                {contract.content}
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <button className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm flex items-center gap-2 hover:bg-rose-600">
                  <Pen size={14} /> 创建契约
                </button>
              </div>
            </motion.div>
          ))}
        </>
      )}

      {displayContracts.map((contract) => (
        <motion.div
          key={contract.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-rose rounded-2xl p-8 mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <FileSignature size={24} className="text-rose-500" />
            <h2 className="text-xl font-semibold text-gray-800">{contract.title}</h2>
          </div>
          <div className="bg-white/60 rounded-xl p-6 whitespace-pre-wrap text-gray-700 leading-relaxed">
            {contract.content}
          </div>

          {/* Signatures */}
          <div className="flex justify-around mt-8">
            <div className="text-center">
              <div className="w-32 h-16 border-b-2 border-dashed border-gray-300 flex items-end justify-center pb-1">
                {contract.signature1 ? (
                  <img src={contract.signature1} alt="签名1" className="max-h-14" />
                ) : (
                  <span className="text-gray-300 text-sm">未签名</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <User size={12} />
                甲方
                {contract.signed_by_partner1 && <Check size={12} className="text-green-500" />}
              </p>
              {!contract.signed_by_partner1 && (
                <button
                  onClick={() => startSigning(contract.id, 'partner1')}
                  className="mt-2 text-xs text-rose-400 hover:text-rose-500 flex items-center gap-1 mx-auto"
                >
                  <Pen size={12} /> 签名
                </button>
              )}
            </div>
            <div className="text-center">
              <div className="w-32 h-16 border-b-2 border-dashed border-gray-300 flex items-end justify-center pb-1">
                {contract.signature2 ? (
                  <img src={contract.signature2} alt="签名2" className="max-h-14" />
                ) : (
                  <span className="text-gray-300 text-sm">未签名</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <User size={12} />
                乙方
                {contract.signed_by_partner2 && <Check size={12} className="text-green-500" />}
              </p>
              {!contract.signed_by_partner2 && (
                <button
                  onClick={() => startSigning(contract.id, 'partner2')}
                  className="mt-2 text-xs text-rose-400 hover:text-rose-500 flex items-center gap-1 mx-auto"
                >
                  <Pen size={12} /> 签名
                </button>
              )}
            </div>
          </div>

          {/* Signature pad */}
          {signing === contract.id && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6">
              <p className="text-sm text-gray-500 mb-2 text-center">请在下方签名</p>
              <canvas
                ref={canvasRef}
                width={300}
                height={100}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border border-gray-200 rounded-xl bg-white mx-auto block cursor-crosshair"
              />
              <div className="flex justify-center gap-3 mt-3">
                <button
                  onClick={() => saveSignature(contract.id)}
                  className="px-5 py-1.5 bg-rose-500 text-white rounded-full text-sm hover:bg-rose-600"
                >
                  确认签名
                </button>
                <button
                  onClick={() => setSigning(null)}
                  className="px-5 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200"
                >
                  取消
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
