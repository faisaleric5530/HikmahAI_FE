import { create } from 'zustand'

export interface Blog {
  id: string
  title: string
  body: string
  excerpt: string
  authorName: string
  authorId: string
  createdAt: string
  status?: 'draft' | 'published'
}

interface BlogState {
  blogs: Blog[]
  activeBlog: Blog | null
  isLoading: boolean
  setBlogs: (blogs: Blog[]) => void
  setActiveBlog: (blog: Blog | null) => void
  fetchBlogs: () => Promise<void>
  createBlog: (title: string, body: string) => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useBlogStore = create<BlogState>((set) => ({
  blogs: [],
  activeBlog: null,
  isLoading: false,
  setBlogs: (blogs) => set({ blogs }),
  setActiveBlog: (blog) => set({ activeBlog: blog }),
  fetchBlogs: async () => {},
  createBlog: async (_title: string, _body: string) => {},
  setLoading: (loading) => set({ isLoading: loading }),
}))
