import axiosInstance from './axiosInstance'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

export interface ScholarApplication {
  id: string
  fullName: string
  qualifications: string
  ijazah?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export async function applyForScholar(credentials: {
  fullName: string
  qualifications: string
  ijazah?: string
}): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000))
    return { success: true, message: 'Your application has been submitted for review.' }
  }
  await axiosInstance.post<ScholarApplication>('/scholar-applications', credentials)
  return { success: true, message: 'Your application has been submitted for review.' }
}

export async function fetchMyScholarApplication(): Promise<ScholarApplication | null> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return null
  }
  const response = await axiosInstance.get<ScholarApplication | null>('/scholar-applications/me')
  return response.data
}
