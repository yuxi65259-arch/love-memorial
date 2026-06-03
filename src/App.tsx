import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import TimelinePage from '@/pages/TimelinePage'
import GalleryPage from '@/pages/GalleryPage'
import MessagesPage from '@/pages/MessagesPage'
import WishesPage from '@/pages/WishesPage'
import CheckInPage from '@/pages/CheckInPage'
import CapsulePage from '@/pages/CapsulePage'
import ContractPage from '@/pages/ContractPage'
import SecretPage from '@/pages/SecretPage'

export default function App() {
  return (
    <BrowserRouter basename="/love-memorial">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="wishes" element={<WishesPage />} />
          <Route path="checkin" element={<CheckInPage />} />
          <Route path="capsule" element={<CapsulePage />} />
          <Route path="contract" element={<ContractPage />} />
          <Route path="secret" element={<SecretPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
