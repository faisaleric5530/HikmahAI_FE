import { useEffect, useCallback } from 'react'
import { useChannelStore } from '@/store/useChannelStore'
import { useAuthStore } from '@/store/useAuthStore'
import { fetchChannels, fetchQuestions, postQuestion, postReply, markReplyVerified } from '@/api/channelsApi'

export function useChannels() {
  const store = useChannelStore()

  useEffect(() => {
    if (store.channels.length === 0) {
      store.setLoading(true)
      fetchChannels().then((data) => {
        useChannelStore.setState({ channels: data, isLoading: false })
      })
    }
  }, [])

  return store
}

export function useChannelDetail(channelId: string) {
  const store = useChannelStore()

  const loadQuestions = useCallback(async () => {
    store.setLoading(true)
    const data = await fetchQuestions(channelId)
    const me = useAuthStore.getState().user
    if (me) {
      data.forEach((q) => {
        if (q.authorPublicId === me.id) q.authorName = me.name
        q.replies.forEach((r) => {
          if (r.authorPublicId === me.id) r.authorName = me.name
        })
      })
    }
    useChannelStore.setState({ questions: data, isLoading: false })
  }, [channelId])

  const submitQuestion = async (title: string, body: string) => {
    await postQuestion(channelId, title, body)
    await loadQuestions()
  }

  const submitReply = async (questionId: string, body: string) => {
    await postReply(questionId, body)
    await loadQuestions()
  }

  const verifyReply = async (replyId: string) => {
    await markReplyVerified(replyId)
    await loadQuestions()
  }

  return {
    questions: store.questions,
    isLoading: store.isLoading,
    loadQuestions,
    submitQuestion,
    submitReply,
    verifyReply,
  }
}
