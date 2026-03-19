import type { Channel as ChannelType } from '../../lib/api'

interface ChannelProps {
  channel: ChannelType
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  disabled: boolean
}

export default function Channel({ channel, isActive, onSelect, onDelete, disabled }: ChannelProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <button
        type="button"
        className={`rounded-md border px-3 py-2 text-left text-sm transition ${
          isActive
            ? 'border-rose bg-overlay font-semibold'
            : 'border-overlay bg-surface hover:border-foam'
        }`}
        onClick={onSelect}
      >
        {channel.name}
      </button>
      <button
        type="button"
        className="rounded-md border border-love/70 bg-love/20 px-3 py-2 text-sm transition hover:bg-love/30 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Delete ${channel.name}`}
      >
        x
      </button>
    </div>
  )
}
