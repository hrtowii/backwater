import { useState } from 'react'
import type { Channel as ChannelType } from '../../lib/api'
import '../../styles.css'
interface ChannelProps {
  channel: ChannelType
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  disabled: boolean
}
export default function Channel({ channel, isActive, onSelect, onDelete, disabled }: ChannelProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex w-full items-stretch gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={`min-w-0 flex-1 rounded-md border px-3 py-2 text-left text-sm transition ${isActive ? 'border-rose bg-overlay font-semibold' : 'border-overlay bg-surface'
          }`}
        onClick={onSelect}
      >
        {channel.name}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Delete ${channel.name}`}
        className="self-stretch shrink-0 rounded-md border border-love/70 bg-love/20 text-sm hover:bg-love/30 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
        style={{
          width: hovered ? '2rem' : '0',
          opacity: hovered ? 1 : 0,
          transition: 'width 180ms ease-out, opacity 180ms ease-out',
          pointerEvents: hovered ? 'auto' : 'none',
          padding: hovered ? undefined : '0',
        }}
      >
        ✕
      </button>
    </div>
  )
}
