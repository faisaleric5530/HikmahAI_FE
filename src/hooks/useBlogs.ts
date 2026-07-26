import { useEffect } from 'react'
import { useBlogStore } from '@/store/useBlogStore'
import { fetchBlogs, createBlog } from '@/api/blogsApi'

export function useBlogs() {
  const store = useBlogStore()

  useEffect(() => {
    if (store.blogs.length === 0) {
      loadBlogs()
    }
  }, [])

  const loadBlogs = async () => {
    store.setLoading(true)
    const data = await fetchBlogs()
    store.setBlogs(data)
    store.setLoading(false)
  }

  const submitBlog = async (title: string, body: string) => {
    const blog = await createBlog(title, body)
    store.setBlogs([blog, ...store.blogs])
    return blog
  }

  return {
    blogs: store.blogs,
    isLoading: store.isLoading,
    activeBlog: store.activeBlog,
    setActiveBlog: store.setActiveBlog,
    loadBlogs,
    submitBlog,
  }
}
