import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/store/useAuthStore'

interface RoleRouteProps {
  children: React.ReactNode
  allow: UserRole[]
  fallbackPath?: string
}

export function RoleRoute({ children, allow, fallbackPath = '/' }: RoleRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !allow.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
