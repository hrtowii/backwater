import { useState } from 'react'
import type { Channel as ChannelType } from '../../lib/api'

interface ChannelRowProps {
  channel: ChannelType
  isActive: boolean
  selectedThreadId: number | null
  onToggleExpand: () => void
  expanded: boolean
  hasThreads: boolean
  onSelect: () => void
  onDelete: () => void
  onToggleThreadInput: () => void
  disabled: boolean
}

export default function ChannelRow({
  channel,
  isActive,
  selectedThreadId,
  onToggleExpand,
  expanded,
  hasThreads,
  onSelect,
  onDelete,
  onToggleThreadInput,
  disabled,
}: ChannelRowProps) {
  const [hovered, setHovered] = useState(false)

  const hiddenStyle = (hovered: boolean): React.CSSProperties => ({
    width: hovered ? '2rem' : '0',
    opacity: hovered ? 1 : 0,
    transition: 'width 180ms ease-out, opacity 180ms ease-out',
    pointerEvents: hovered ? 'auto' : 'none',
    padding: hovered ? undefined : '0',
    border: hovered ? undefined : 'none',
  })

  return (
    <div
      className="grid w-full items-stretch gap-2"
      style={{ gridTemplateColumns: 'auto 1fr auto auto' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hasThreads ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className="self-stretch shrink-0 px-1 text-muted transition hover:text-text"
          aria-label={expanded ? 'Collapse threads' : 'Expand threads'}
        >
          {expanded ? '▾' : '▸'}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        className={`min-w-0 truncate rounded-md border px-3 py-2 text-left text-sm transition ${
          isActive && selectedThreadId === null
            ? 'border-rose bg-overlay font-semibold'
            : 'border-overlay bg-surface'
        }`}
        onClick={onSelect}
      >
        {channel.name}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleThreadInput()
        }}
        disabled={disabled}
        title="Add thread"
        className="self-stretch shrink-0 rounded-md border border-overlay bg-surface px-1.5 text-sm transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
        style={hiddenStyle(hovered)}
      >
        +
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Delete ${channel.name}`}
        className="self-stretch shrink-0 rounded-md border border-love/70 bg-love/20 text-sm hover:bg-love/30 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
        style={hiddenStyle(hovered)}
      >
        ✕
      </button>
    </div>
  )
}
