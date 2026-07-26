import type { Channel, Question } from '@/store/useChannelStore'
import type { Blog } from '@/store/useBlogStore'
import type { ChatMessage } from '@/store/useChatStore'

export const mockChannels: Channel[] = [
  { id: 'ch-1', name: 'Aqeedah', description: 'Discussions on Islamic creed and theology', questionCount: 12 },
  { id: 'ch-2', name: 'Fiqh', description: 'Islamic jurisprudence and rulings', questionCount: 8 },
  { id: 'ch-3', name: 'Tafsir', description: 'Quranic exegesis and interpretation', questionCount: 15 },
  { id: 'ch-4', name: 'Hadith', description: 'Study of prophetic traditions', questionCount: 10 },
  { id: 'ch-5', name: 'Seerah', description: 'Life and teachings of Prophet Muhammad (PBUH)', questionCount: 6 },
  { id: 'ch-6', name: 'Spirituality', description: 'Tazkiyah, dhikr, and spiritual growth', questionCount: 9 },
]

export const mockQuestions: Record<string, Question[]> = {
  'ch-1': [
    {
      id: 'q-1', channelId: 'ch-1',
      title: 'What are the 99 names of Allah?',
      body: 'Could someone explain the significance of learning and memorizing the 99 names of Allah (Asma ul-Husna)?',
      authorName: 'Ahmad R.', createdAt: '2026-07-20T10:30:00Z', isVerifiedAnswer: true,
      madhabTag: 'general',
      replies: [
        { id: 'r-1', questionId: 'q-1', body: 'The 99 names of Allah are divine attributes that reveal His nature. The Prophet (PBUH) said: "Indeed, Allah has 99 names, whoever memorizes them will enter Paradise." (Bukhari). Each name reflects a distinct attribute - Ar-Rahman (The Most Gracious), Al-Hakim (The All-Wise), Al-Ghafur (The Oft-Forgiving). Learning them deepens your connection with Allah and improves your worship.', authorName: 'Dr. Hassan', authorRole: 'scholar', isVerifiedAnswer: true, createdAt: '2026-07-20T14:00:00Z' },
        { id: 'r-2', questionId: 'q-1', body: 'I recommend the book "Al-Maqsad al-Asna" by Imam Al-Ghazali for a deeper study.', authorName: 'Fatima K.', authorRole: 'user', isVerifiedAnswer: false, createdAt: '2026-07-21T09:15:00Z' },
      ],
    },
    {
      id: 'q-2', channelId: 'ch-1',
      title: 'How does Tawheed manifest in daily life?',
      body: 'How can we practice Tawheed (monotheism) in our everyday actions beyond just belief?',
      authorName: 'Yusuf M.', createdAt: '2026-07-18T08:00:00Z', isVerifiedAnswer: true,
      madhabTag: 'general',
      replies: [
        { id: 'r-3', questionId: 'q-2', body: 'Tawheed manifests when you rely solely on Allah (Tawakkul), when you seek only His pleasure in your actions, and when you fear none but Him. In daily life: start tasks with Bismillah, attribute success to Allah\'s will, and turn to Him in hardship. This is the essence of "Iyyaka na\'budu wa iyyaka nasta\'een" (You alone we worship, You alone we ask for help).', authorName: 'Sh. Omar Al-Farooq', authorRole: 'scholar', isVerifiedAnswer: true, createdAt: '2026-07-18T12:30:00Z' },
      ],
    },
  ],
  'ch-2': [
    {
      id: 'q-3', channelId: 'ch-2',
      title: 'What is the ruling on interest (riba)?',
      body: 'Can someone explain the different types of riba and why it is prohibited?',
      authorName: 'Ali S.', createdAt: '2026-07-19T16:45:00Z', isVerifiedAnswer: true,
      madhabTag: 'general',
      replies: [
        { id: 'r-4', questionId: 'q-3', body: 'Riba (interest/usury) is strictly prohibited in Islam. Allah says: "Allah has permitted trade and forbidden riba" (Quran 2:275). There are two main types: Riba al-Nasi\'ah (interest on loans) and Riba al-Fadl (excess in barter exchange). The prohibition is absolute - both giving and receiving interest are sinful. Muslims must avoid conventional banking interest and seek Shariah-compliant alternatives.', authorName: 'Mufti Ibrahim', authorRole: 'scholar', isVerifiedAnswer: true, createdAt: '2026-07-19T19:00:00Z' },
      ],
    },
  ],
}

export const mockBlogs: Blog[] = [
  {
    id: 'b-1',
    title: 'The Mercy of Allah: Understanding Ar-Rahman and Ar-Raheem',
    body: '<p>The names Ar-Rahman and Ar-Raheem both derive from the root "rahmah" (mercy), but they carry distinct meanings. Ar-Rahman refers to Allah\'s universal mercy that encompasses all of creation - believer and disbeliever alike. Ar-Raheem refers to His specific mercy reserved for the believers.</p><p>Every breath we take, every meal we eat, every moment of peace we enjoy - these are manifestations of Ar-Rahman. The guidance to Islam, the promise of Paradise, the forgiveness of sins - these are gifts of Ar-Raheem.</p><p>Reflecting on these names transforms our relationship with Allah. We realize that His mercy is not something we earn, but something He bestows out of His infinite generosity. This understanding breeds humility, gratitude, and hope.</p>',
    excerpt: 'Reflecting on the two most frequent names of Allah and how understanding them transforms our spiritual lives.',
    authorName: 'Umm Salamah', authorId: 'user-3', createdAt: '2026-07-22T08:00:00Z',
  },
  {
    id: 'b-2',
    title: 'The Spiritual Benefits of Fasting Beyond Ramadan',
    body: '<p>While Ramadan is the month of obligatory fasting, the Sunnah encourages voluntary fasting throughout the year. Mondays and Thursdays, the three white days (13th, 14th, 15th of each lunar month), and the day of Arafah are all recommended times.</p><p>Beyond the physical discipline, fasting trains the soul in taqwa (God-consciousness). When we voluntarily give up lawful food and drink for Allah\'s sake, we strengthen our willpower and deepen our awareness of His presence. It is a private act of worship - no one knows you are fasting except Allah.</p><p>This privacy creates a profound spiritual intimacy. Your Lord knows your hunger, your thirst, your sacrifice - and He treasures it.</p>',
    excerpt: 'Discover the transformative power of voluntary fasting and how it strengthens your spiritual connection.',
    authorName: 'Abdullah H.', authorId: 'user-4', createdAt: '2026-07-20T14:30:00Z',
  },
  {
    id: 'b-3',
    title: 'Understanding Qadr: Navigating Destiny with Faith',
    body: '<p>The concept of divine decree (Qadr) is one of the most profound and sometimes challenging aspects of Islamic theology. Belief in Qadr is one of the six pillars of faith.</p><p>It is essential to understand that Qadr does not negate human free will. We make choices, and we are accountable for them. But Allah\'s knowledge encompasses all - past, present, and future. He knows what we will choose before we choose it, and His knowledge does not compel our actions.</p><p>The beauty of Qadr is that it brings peace. When something good happens, we thank Allah. When something difficult occurs, we know it is from Allah\'s wisdom, even if we cannot comprehend it. This trust (Tawakkul) is the heart of a believer\'s serenity.</p>',
    excerpt: 'Exploring the Islamic understanding of divine decree and how it brings peace to the believing heart.',
    authorName: 'Dr. Hassan', authorId: 'scholar-1', createdAt: '2026-07-18T11:00:00Z',
  },
]

const islamicReplies = [
  {
    reply: 'Assalamu Alaikum. Thank you for your question. In the Quran, Allah says: "And We have certainly made the Quran easy to remember, so is there any who will remember?" (54:17). This verse reminds us that the Quran was revealed as a guide and a mercy. The key is to approach it with sincerity (ikhlas) and to seek refuge in Allah from Shaytan before reciting. May Allah increase us all in knowledge and understanding.',
    detectedLang: 'en',
    sources: [{ type: 'quran' as const, reference: 'Surah Al-Qamar 54:17' }],
  },
  {
    reply: 'The Prophet Muhammad (PBUH) said: "The best of you are those who learn the Quran and teach it to others." (Bukhari). This hadith highlights the importance of not just reciting, but understanding and implementing the Quran in our daily lives. Start with small, consistent portions. Even memorizing one verse per week with its meaning will transform your connection with the Book of Allah over time.',
    detectedLang: 'en',
    sources: [{ type: 'hadith' as const, reference: 'Sahih Bukhari, Book 66, Hadith 1' }],
  },
  {
    reply: 'Bismillah. The concept of Tawakkul (reliance on Allah) is beautifully summarized in the verse: "And whoever relies upon Allah - then He is sufficient for him." (Quran 65:3). Tawakkul does not mean passive waiting; it means taking the best possible means (asbab) while placing your complete trust in Allah\'s decree. Tie your camel, then rely on Allah - as the Prophet (PBUH) taught us.',
    detectedLang: 'en',
    sources: [{ type: 'quran' as const, reference: 'Surah At-Talaq 65:3' }],
  },
  {
    reply: 'Regarding the etiquette of making dua (supplication), the Prophet (PBUH) said: "Your Lord is Hayy (Modest) and Karim (Generous). When His servant raises his hands to Him, He feels too shy to return them empty." (Abu Dawud). Begin by praising Allah and sending salawat upon the Prophet, then ask with certainty and humility. The best times for dua are during the last third of the night, between Adhan and Iqamah, and while prostrating.',
    detectedLang: 'en',
    sources: [{ type: 'hadith' as const, reference: 'Sunan Abi Dawud, Book 8, Hadith 1455' }],
  },
  {
    reply: 'Alhamdulillah for the blessing of Islam. Allah says in the Quran: "Indeed, with hardship comes ease. Indeed, with hardship comes ease." (94:5-6). The repetition emphasizes that after every difficulty, relief will follow - not one, but two easements. This is a promise from Allah to the believers. When trials come, remember that they are a means of expiation for sins and elevation in rank. Patience (sabr) is the key.',
    detectedLang: 'en',
    sources: [{ type: 'quran' as const, reference: 'Surah Ash-Sharh 94:5-6' }],
  },
]

export function getMockChatReply(userMessage: string): { reply: string; detectedLang: string; sources: { type: 'quran' | 'hadith'; reference: string }[] } {
  const index = Math.abs(userMessage.length) % islamicReplies.length
  return islamicReplies[index]
}

export function getMockChannels(): Channel[] {
  return mockChannels
}

export function getMockQuestions(channelId: string): Question[] {
  return mockQuestions[channelId] || []
}

export function getMockBlogs(): Blog[] {
  return mockBlogs
}
