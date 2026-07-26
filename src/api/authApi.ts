import axiosInstance from './axiosInstance'
import type { AuthUser } from '@/store/useAuthStore'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

interface AuthResponse {
  token: string
  user: { id: string; name: string; email: string; role: AuthUser['role']; hashIdentity?: boolean; preferredLanguage?: string }
}

function toAuthUser(res: AuthResponse): AuthUser {
  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    role: res.user.role,
    hashIdentity: res.user.hashIdentity ?? false,
    accessToken: res.token,
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    return null
  }
  try {
    const response = await axiosInstance.get<AuthResponse['user']>('/auth/profile')
    return { ...response.data, hashIdentity: response.data.hashIdentity ?? false, accessToken: undefined }
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800))
    return { id: 'user-1', name: 'Test User', email, role: 'user' }
  }
  const response = await axiosInstance.post<AuthResponse>('/auth/login', { email, password })
  return toAuthUser(response.data)
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800))
    return { id: `user-${Date.now()}`, name, email, role: 'user' }
  }
  const response = await axiosInstance.post<AuthResponse>('/auth/register', { name, email, password })
  return toAuthUser(response.data)
}
