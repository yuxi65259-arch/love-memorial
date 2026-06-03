import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="text-center py-6 text-gray-400 text-sm">
      <p className="flex items-center justify-center gap-1">
        Made with <Heart size={14} className="text-rose-400" fill="currentColor" /> for the one I love
      </p>
      <p className="mt-1">Forever & Always</p>
    </footer>
  )
}
