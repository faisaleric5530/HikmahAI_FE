import { create } from 'zustand'

export type UserRole = 'user' | 'scholar' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  accessToken?: string
}

const AUTH_KEY = 'hikmah-auth-user'

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const user = JSON.parse(raw) as AuthUser
    return user?.accessToken ? user : null
  } catch {
    return null
  }
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = getStoredUser()

  return {
    user: initialUser,
    isLoading: false,
    isAuthenticated: !!initialUser,
    setUser: (user) => {
      if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(AUTH_KEY)
      }
      set({ user, isAuthenticated: !!user, isLoading: false })
    },
    logout: () => {
      localStorage.removeItem(AUTH_KEY)
      set({ user: null, isAuthenticated: false, isLoading: false })
    },
    setLoading: (loading) => set({ isLoading: loading }),
  }
})
