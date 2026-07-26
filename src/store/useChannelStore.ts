import { create } from 'zustand'

export type ChannelColor = 'green' | 'blue' | 'amber' | 'purple' | 'orange' | 'teal'

export interface Channel {
  id: string
  name: string
  description: string
  questionCount?: number
  colorVariant?: ChannelColor
}

export interface Question {
  id: string
  channelId: string
  title: string
  body: string
  authorName: string
  authorPublicId?: string
  createdAt: string
  isVerifiedAnswer: boolean
  madhabTag?: string
  replies: Reply[]
}

export interface Reply {
  id: string
  questionId: string
  body: string
  authorName: string
  authorPublicId?: string
  authorRole: 'user' | 'scholar'
  isVerifiedAnswer: boolean
  madhabTag?: string
  createdAt: string
}

interface ChannelState {
  channels: Channel[]
  activeChannel: Channel | null
  questions: Question[]
  isLoading: boolean
  fetchChannels: () => Promise<void>
  setActiveChannel: (channel: Channel | null) => void
  setChannels: (channels: Channel[]) => void
  setLoading: (loading: boolean) => void
  fetchQuestions: (channelId: string) => Promise<void>
  postQuestion: (channelId: string, title: string, body: string) => Promise<void>
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  activeChannel: null,
  questions: [],
  isLoading: false,
  fetchChannels: async () => {},
  setActiveChannel: (channel) => set({ activeChannel: channel }),
  setChannels: (channels) => set({ channels, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  fetchQuestions: async (_channelId: string) => {},
  postQuestion: async (_channelId: string, _title: string, _body: string) => {},
}))
