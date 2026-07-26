import { NavLink } from 'react-router-dom'
import type { Channel } from '@/store/useChannelStore'
import './ChannelCard.scss'

interface ChannelCardProps {
  channel: Channel
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2)
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const variant = channel.colorVariant ?? 'green'
  const initial = getInitials(channel.name)

  return (
    <NavLink
      to={`/channels/${channel.id}`}
      className={({ isActive }) =>
        `channel-row channel-row-${variant}${isActive ? ' channel-row-active' : ''}`
      }
      aria-label={
        channel.questionCount !== undefined
          ? `${channel.name} — ${channel.questionCount} questions`
          : channel.name
      }
    >
      <div className="channel-row-avatar">{initial}</div>
      <div className="channel-row-body">
        <div className="channel-row-top">
          <span className="channel-row-name">{channel.name}</span>
        </div>
        <div className="channel-row-bottom">
          <p className="channel-row-desc">{channel.description}</p>
          {channel.questionCount !== undefined && (
            <span className="channel-row-count">{channel.questionCount}</span>
          )}
        </div>
      </div>
    </NavLink>
  )
}
