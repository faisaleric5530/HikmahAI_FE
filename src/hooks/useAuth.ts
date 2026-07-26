import { useAuthStore } from '@/store/useAuthStore'

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, logout, setLoading } = useAuthStore()

  return {
    user,
    role: user?.role ?? null,
    isScholar: user?.role === 'scholar',
    isAdmin: user?.role === 'admin',
    isLoading,
    isAuthenticated,
    setUser,
    logout,
    setLoading,
  }
}
