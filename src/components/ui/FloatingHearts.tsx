import { useEffect, useState } from 'react'

interface Petal {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  rotation: number
}

export default function FloatingHearts() {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    const items: Petal[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      size: 12 + Math.random() * 16,
      rotation: Math.random() * 360,
    }))
    setPetals(items)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute opacity-30"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            fontSize: `${p.size}px`,
            animation: `petalFall ${p.duration}s ${p.delay}s linear infinite`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {Math.random() > 0.5 ? '🌸' : '💕'}
        </div>
      ))}
    </div>
  )
}
