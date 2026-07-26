import axiosInstance from './axiosInstance'
import { getMockChannels, getMockQuestions } from './mockData'
import type { Channel, Question, Reply } from '@/store/useChannelStore'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

interface QuestionListItem {
  id: string
  channelId: string
  title: string
  body: string
  authorName?: string
  createdAt: string
}

interface QuestionDetail extends QuestionListItem {
  replies: Reply[]
}

function toQuestion(detail: QuestionDetail): Question {
  return {
    ...detail,
    authorName: detail.authorName ?? 'Anonymous',
    isVerifiedAnswer: detail.replies.some((r) => r.isVerifiedAnswer),
    replies: detail.replies,
  }
}

export async function fetchChannels(): Promise<Channel[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return getMockChannels()
  }
  const response = await axiosInstance.get<Channel[]>('/channels')
  return response.data
}

export async function fetchQuestions(channelId: string): Promise<Question[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    return getMockQuestions(channelId)
  }
  const response = await axiosInstance.get<QuestionDetail[]>(`/channels/${channelId}/questions`)
  return response.data.map(toQuestion)
}

export async function postQuestion(
  channelId: string,
  title: string,
  body: string
): Promise<Question> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    return {
      id: `q-${Date.now()}`,
      channelId,
      title,
      body,
      authorName: 'You',
      createdAt: new Date().toISOString(),
      isVerifiedAnswer: false,
      replies: [],
    }
  }
  const response = await axiosInstance.post<QuestionListItem>(`/channels/${channelId}/questions`, {
    title,
    body,
  })
  return toQuestion({ ...response.data, replies: [] })
}

export async function postReply(questionId: string, body: string): Promise<Reply> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    return {
      id: `r-${Date.now()}`,
      questionId,
      body,
      authorName: 'You',
      authorPublicId: undefined,
      authorRole: 'user',
      isVerifiedAnswer: false,
      createdAt: new Date().toISOString(),
    }
  }
  const response = await axiosInstance.post<Reply>(`/questions/${questionId}/replies`, { body })
  return response.data
}

export async function markReplyVerified(replyId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return
  }
  await axiosInstance.patch(`/replies/${replyId}/verify`)
}
