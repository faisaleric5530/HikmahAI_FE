import axios from 'axios'
import { useAuthStore } from '@/store/useAuthStore'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach Bearer token from Zustand store on every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().user?.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Backend wraps every response as { status, success, message, data } — unwrap
// so callers can keep treating response.data as the resource itself.
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
