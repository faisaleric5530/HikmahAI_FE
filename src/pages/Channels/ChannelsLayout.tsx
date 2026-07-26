import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Search, ChevronLeft } from 'lucide-react'
import { MosqueIcon } from '@/components/Icons/MosqueIcon'
import { useChannels } from '@/hooks/useChannels'
import { ChannelCard } from '@/components/ChannelCard/ChannelCard'
import './ChannelsLayout.scss'

function ChannelEmptyPanel() {
  return (
    <div className="channel-panel-empty">
      <div className="channel-panel-empty-icon">
        <MosqueIcon size={44} />
      </div>
      <h2 className="channel-panel-empty-title">Select a Channel</h2>
      <p className="channel-panel-empty-desc">
        Choose a topic from the sidebar to browse discussions and get answers from scholars.
      </p>
    </div>
  )
}

export function ChannelsLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { channels } = useChannels()

  const hasChannel =
    location.pathname !== '/channels' && location.pathname.startsWith('/channels/')

  const filtered = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="channels-split">
      <aside className={`channels-sidebar${hasChannel ? ' channels-sidebar-mobile-hidden' : ''}`}>
        <div className="channels-sidebar-header">
          <div className="channels-sidebar-brand">
            <MosqueIcon size={17} />
            <span>Hikmah Channels</span>
          </div>
          {channels.length > 0 && (
            <span className="channels-sidebar-badge">{channels.length}</span>
          )}
        </div>

        <div className="channels-search-wrap">
          <Search size={14} className="channels-search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search channels…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="channels-search-input"
            aria-label="Search channels"
          />
        </div>

        <div className="channels-sidebar-list" role="list">
          {filtered.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
          {filtered.length === 0 && channels.length > 0 && (
            <p className="channels-sidebar-empty">No channels match "{search}"</p>
          )}
        </div>
      </aside>

      <div className={`channels-panel${!hasChannel ? ' channels-panel-mobile-hidden' : ''}`}>
        {hasChannel && (
          <button
            className="channels-panel-back-mobile"
            onClick={() => navigate('/channels')}
            aria-label="Back to channels list"
          >
            <ChevronLeft size={16} />
            <span>All Channels</span>
          </button>
        )}
        <div className="channels-panel-scroll">
          {hasChannel ? <Outlet /> : <ChannelEmptyPanel />}
        </div>
      </div>
    </div>
  )
}
