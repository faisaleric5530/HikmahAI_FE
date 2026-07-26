import axiosInstance from './axiosInstance'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

export interface PlatformStats {
  qnaAnswered: number
  topicChannels: number
  publishedArticles: number
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return { qnaAnswered: 60, topicChannels: 6, publishedArticles: 3 }
  }
  const response = await axiosInstance.get<PlatformStats>('/stats')
  return response.data
}
