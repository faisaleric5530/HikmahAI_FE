import axiosInstance from './axiosInstance'
import { getMockBlogs } from './mockData'
import type { Blog } from '@/store/useBlogStore'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

export async function fetchBlogs(): Promise<Blog[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return getMockBlogs()
  }
  const response = await axiosInstance.get<Blog[]>('/blogs')
  return response.data
}

export async function fetchBlogById(id: string): Promise<Blog> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    const blogs = getMockBlogs()
    const blog = blogs.find((b) => b.id === id)
    if (!blog) throw new Error(`Blog ${id} not found`)
    return blog
  }
  const response = await axiosInstance.get<Blog>(`/blogs/${id}`)
  return response.data
}

export async function createBlog(title: string, body: string): Promise<Blog> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    return {
      id: `b-${Date.now()}`,
      title,
      body,
      excerpt: body.replace(/<[^>]+>/g, '').slice(0, 150),
      authorName: 'You',
      authorId: 'user-current',
      createdAt: new Date().toISOString(),
    }
  }
  const response = await axiosInstance.post<Blog>('/blogs', { title, body })
  return response.data
}

export async function updateBlog(id: string, title: string, body: string): Promise<Blog> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    return {
      id,
      title,
      body,
      excerpt: body.replace(/<[^>]+>/g, '').slice(0, 150),
      authorName: 'You',
      authorId: 'user-current',
      createdAt: new Date().toISOString(),
    }
  }
  const response = await axiosInstance.patch<Blog>(`/blogs/${id}`, { title, body })
  return response.data
}

export async function deleteBlog(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return
  }
  await axiosInstance.delete(`/blogs/${id}`)
}
