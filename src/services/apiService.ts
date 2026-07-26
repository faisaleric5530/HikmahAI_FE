import axios from 'axios'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

const useApiService = () => {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const apiClient = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    })

    instance.interceptors.request.use(
      (config) => {
        const token = user?.accessToken
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    instance.interceptors.response.use(
      (response) => {
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          response.data = response.data.data
        }
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          logout()
          navigate('/sign-in')
        }
        return Promise.reject(error)
      }
    )

    return instance
  }, [user?.accessToken])

  const getRequest = async <T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> => {
    try {
      const response = await apiClient.get<T>(endpoint, { params })
      return response.data
    } catch (error) {
      console.error('GET request error:', error)
      throw error
    }
  }

  const postRequest = async <T = unknown>(
    endpoint: string,
    data?: unknown
  ): Promise<T> => {
    try {
      const response = await apiClient.post<T>(endpoint, data)
      return response.data
    } catch (error) {
      console.error('POST request error:', error)
      throw error
    }
  }

  const putRequest = async <T = unknown>(
    endpoint: string,
    data?: unknown
  ): Promise<T> => {
    try {
      const response = await apiClient.put<T>(endpoint, data)
      return response.data
    } catch (error) {
      console.error('PUT request error:', error)
      throw error
    }
  }

  const patchRequest = async <T = unknown>(
    endpoint: string,
    data?: unknown
  ): Promise<T> => {
    try {
      const response = await apiClient.patch<T>(endpoint, data)
      return response.data
    } catch (error) {
      console.error('PATCH request error:', error)
      throw error
    }
  }

  const deleteRequest = async <T = unknown>(endpoint: string): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(endpoint)
      return response.data
    } catch (error) {
      console.error('DELETE request error:', error)
      throw error
    }
  }

  return {
    getRequest,
    postRequest,
    putRequest,
    patchRequest,
    deleteRequest,
  }
}

export default useApiService
