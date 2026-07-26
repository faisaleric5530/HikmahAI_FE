import { useEffect, useRef } from 'react'
import { useAuthStore, type AuthUser } from '@/store/useAuthStore'

interface SessionShape {
  userId: string
  role: string
  issuedAt: string
}

async function computeChecksum(session: SessionShape): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(session))
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const SESSION_KEY = 'hikmah_session_check'

function buildSession(user: AuthUser): SessionShape {
  return { userId: user.id, role: user.role, issuedAt: new Date().toISOString() }
}

export function useSessionIntegrity() {
  const { user, logout } = useAuthStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem(SESSION_KEY)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    const session = buildSession(user)
    computeChecksum(session).then((hash) => {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session, hash }))
    })

    intervalRef.current = setInterval(async () => {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (!stored) {
        logout()
        return
      }
      const parsed = JSON.parse(stored)
      const currentHash = await computeChecksum(parsed.session)
      if (currentHash !== parsed.hash) {
        sessionStorage.removeItem(SESSION_KEY)
        logout()
      }
    }, 30000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, logout])
}
