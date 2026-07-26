import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { useChannels } from '@/hooks/useChannels'
import { ChannelCard } from '@/components/ChannelCard/ChannelCard'
import { GridSkeleton } from '@/components/Skeletons/Skeletons'
import { MosqueIcon } from '@/components/Icons/MosqueIcon'
import './ChannelList.scss'

export function ChannelList() {
  const { t } = useTranslation()
  const { channels, isLoading } = useChannels()
  const [search, setSearch] = useState('')

  const filtered = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="channel-list-page">
      <div className="channel-list-header">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <MosqueIcon size={22} className="page-head-icon" />
          <div>
            <h1 className="page-head-title">{t('channels.title')}</h1>
            <p className="page-head-desc">Browse topics and ask questions to the community</p>
          </div>
        </div>

        <div className="channel-search-wrap">
          <Search size={15} className="channel-search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search channels…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="channel-search-input"
            aria-label="Search channels"
          />
        </div>
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No channels found</p>
          <p className="empty-state-desc">Try a different search term.</p>
        </div>
      ) : (
        <div className="channel-list">
          {filtered.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  )
}
