import axiosInstance from './axiosInstance'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

export interface ScholarApplication {
  id: string
  fullName: string
  qualifications: string
  ijazah?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewerNote: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  applicant?: {
    id: string
    name: string
    email: string
  }
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

export async function fetchAllScholarApplications(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<ScholarApplication[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    return []
  }
  const params = status ? { status } : {}
  const response = await axiosInstance.get<ScholarApplication[]>('/scholar-applications', { params })
  return response.data
}

export async function reviewScholarApplication(
  id: string,
  status: 'approved' | 'rejected',
  reviewerNote?: string
): Promise<ScholarApplication> {
  const response = await axiosInstance.patch<ScholarApplication>(
    `/scholar-applications/${id}`,
    { status, reviewerNote }
  )
  return response.data
}
