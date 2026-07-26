import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Header } from '@/components/Header/Header'
import { Footer } from '@/components/Footer/Footer'
import { Home } from '@/pages/Home/Home'
import { SignIn } from '@/pages/Auth/SignIn'
import { SignUp } from '@/pages/Auth/SignUp'
import { Chat } from '@/pages/Chat/Chat'
import { ChannelsLayout } from '@/pages/Channels/ChannelsLayout'
import { ChannelDetail } from '@/pages/Channels/ChannelDetail/ChannelDetail'
import { AskQuestion } from '@/pages/Channels/AskQuestion/AskQuestion'
import { BlogList } from '@/pages/Blogs/BlogList/BlogList'
import { BlogDetail } from '@/pages/Blogs/BlogDetail/BlogDetail'
import { BlogEditor } from '@/pages/Blogs/BlogEditor/BlogEditor'
import { ScholarApplication } from '@/pages/ScholarApplication/ScholarApplication'
import { useSessionIntegrity } from '@/hooks/useSessionIntegrity'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }
  return <>{children}</>
}

function AppContent() {
  useSessionIntegrity()
  const theme = useUIStore((s) => s.theme)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
      navigate('/sign-in')
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [logout, navigate])
  const isFullHeight =
    location.pathname === '/chat' || location.pathname.startsWith('/channels')
  const isAuthPage =
    location.pathname === '/sign-in' || location.pathname === '/sign-up'

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg)',
        ...(isFullHeight ? { height: '100dvh', overflow: 'hidden' } : { minHeight: '100vh' }),
      }}
    >
      <Header />
      <main style={{ flex: 1, minHeight: 0, ...(isFullHeight ? { overflow: 'hidden' } : {}) }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />

          <Route path="/channels" element={<RequireAuth><ChannelsLayout /></RequireAuth>}>
            <Route path=":id" element={<ChannelDetail />} />
            <Route path=":id/ask" element={<AskQuestion />} />
          </Route>

          <Route path="/blogs" element={<RequireAuth><BlogList /></RequireAuth>} />
          <Route path="/blogs/new" element={<RequireAuth><BlogEditor /></RequireAuth>} />
          <Route path="/blogs/:id" element={<RequireAuth><BlogDetail /></RequireAuth>} />
          <Route path="/scholar-application" element={<RequireAuth><ScholarApplication /></RequireAuth>} />
        </Routes>
      </main>
      {!isFullHeight && !isAuthPage && <Footer />}
      <ToastContainer position="bottom-right" theme={theme} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
