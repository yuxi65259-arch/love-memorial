import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import FloatingHearts from '@/components/ui/FloatingHearts'
import MusicPlayer from '@/components/ui/MusicPlayer'
import { useFestivalTheme, FestivalBanner } from '@/components/ui/FestivalTheme'

export default function Layout() {
  const { festival, birthday, showBanner, setShowBanner } = useFestivalTheme()

  return (
    <div className="min-h-screen flex flex-col relative">
      <FloatingHearts />
      <FestivalBanner
        festival={festival}
        birthday={birthday}
        showBanner={showBanner}
        onClose={() => setShowBanner(false)}
      />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
      <MusicPlayer src={import.meta.env.VITE_BGM_URL || ''} />
    </div>
  )
}
