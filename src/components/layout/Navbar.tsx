import { Link, useLocation } from 'react-router-dom'
import { Heart, Clock, Images, MessageCircle, ListChecks, CalendarCheck, Lock, FileSignature, Timer } from 'lucide-react'

const links = [
  { to: '/', icon: Heart, label: '首页' },
  { to: '/timeline', icon: Clock, label: '时间轴' },
  { to: '/gallery', icon: Images, label: '照片墙' },
  { to: '/messages', icon: MessageCircle, label: '留言板' },
  { to: '/wishes', icon: ListChecks, label: '愿望' },
  { to: '/checkin', icon: CalendarCheck, label: '打卡' },
  { to: '/capsule', icon: Timer, label: '胶囊' },
  { to: '/contract', icon: FileSignature, label: '契约' },
  { to: '/secret', icon: Lock, label: '秘密' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/30">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 text-rose-500 font-semibold text-lg">
          <Heart size={20} className="animate-heartbeat" fill="currentColor" />
          <span className="hidden sm:inline">Our Love</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center px-2 py-1 rounded-lg text-xs transition-colors whitespace-nowrap ${
                location.pathname === to
                  ? 'text-rose-500 bg-rose-50'
                  : 'text-gray-500 hover:text-rose-400 hover:bg-rose-50/50'
              }`}
            >
              <Icon size={18} />
              <span className="hidden md:inline mt-0.5">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
