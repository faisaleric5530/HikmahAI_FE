import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}
