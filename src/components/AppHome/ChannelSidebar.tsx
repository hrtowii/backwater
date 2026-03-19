import { Link } from '@tanstack/react-router'
import type { Channel as ChannelType } from '../../lib/api'
import { normalizeChannelName } from './utils'
import Channel from './Channel'

interface ChannelSidebarProps {
  channels: ChannelType[]
  selectedChannelId: number | null
  channelName: string
  onChannelNameChange: (value: string) => void
  onCreateChannel: (event: React.FormEvent<HTMLFormElement>) => void
  onSelectChannel: (channelId: number) => void
  onDeleteChannel: (channelId: number) => void
  loading: boolean
}

export default function ChannelSidebar({
  channels,
  selectedChannelId,
  channelName,
  onChannelNameChange,
  onCreateChannel,
  onSelectChannel,
  onDeleteChannel,
  loading,
}: ChannelSidebarProps) {
  function handleChannelNameChange(value: string) {
    const normalized = normalizeChannelName(value)
    onChannelNameChange(normalized)
  }

  return (
    <aside className="border-b border-overlay/60 bg-base/70 p-5 backdrop-blur md:border-b-0 md:border-r">
      <div className="mb-5 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl leading-none tracking-wide sm:text-3xl md:text-3xl md:tracking-[0.1em]">
            backwater
          </h1>
        </div>
        <Link
          to="/settings"
          className="flex-shrink-0 rounded-md border border-overlay bg-surface px-2.5 py-2 text-sm transition hover:bg-highlight-med sm:px-3"
          title="Settings"
        >
          ⚙
        </Link>
      </div>

      <form onSubmit={onCreateChannel} className="flex gap-2">
        <input
          value={channelName}
          onChange={(event) => handleChannelNameChange(event.target.value)}
          placeholder="new channel"
          className="w-full rounded-md border border-overlay bg-surface px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-rose"
          maxLength={80}
        />
        <button
          type="submit"
          className="rounded-md border border-rose/70 bg-overlay px-3 py-2 text-sm font-semibold tracking-wide transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          add
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {channels.map((channel) => (
          <Channel
            key={channel.id}
            channel={channel}
            isActive={channel.id === selectedChannelId}
            onSelect={() => onSelectChannel(channel.id)}
            onDelete={() => onDeleteChannel(channel.id)}
            disabled={loading}
          />
        ))}
      </div>
    </aside>
  )
}
