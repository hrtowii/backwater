import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Channel as ChannelType, Thread as ThreadType, SelectedView } from '../../lib/api'
import { normalizeChannelName } from './utils'
import Channel from './Channel'

interface ChannelSidebarProps {
  channels: ChannelType[]
  threads: Map<number, ThreadType[]>
  selectedView: SelectedView | null
  channelName: string
  onChannelNameChange: (value: string) => void
  onCreateChannel: (event: React.FormEvent<HTMLFormElement>) => void
  onSelectChannel: (channelId: number) => void
  onDeleteChannel: (channelId: number) => void
  onSelectThread: (threadId: number, channelId: number) => void
  onDeleteThread: (threadId: number, channelId: number) => void
  onCreateThread: (channelId: number, name: string) => void
  loading: boolean
}

export default function ChannelSidebar({
  channels,
  threads,
  selectedView,
  channelName,
  onChannelNameChange,
  onCreateChannel,
  onSelectChannel,
  onDeleteChannel,
  onSelectThread,
  onDeleteThread,
  onCreateThread,
  loading,
}: ChannelSidebarProps) {
  const [expandedChannels, setExpandedChannels] = useState<Set<number>>(new Set())

  function handleChannelNameChange(value: string) {
    const normalized = normalizeChannelName(value)
    onChannelNameChange(normalized)
  }

  function toggleExpand(channelId: number) {
    setExpandedChannels((prev) => {
      const next = new Set(prev)
      if (next.has(channelId)) {
        next.delete(channelId)
      } else {
        next.add(channelId)
      }
      return next
    })
  }

  return (
    <aside className="border-b border-overlay/60 bg-base/70 p-5 backdrop-blur md:border-b-0 md:border-r">
      <div className="mb-5 flex items-start justify-between gap-2">
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
        {channels.map((channel) => {
          const channelThreads = threads.get(channel.id) ?? []
          const isChannelActive =
            selectedView !== null &&
            ((selectedView.type === 'channel' && selectedView.id === channel.id) ||
              (selectedView.type === 'thread' && selectedView.channelId === channel.id))

          return (
            <Channel
              key={channel.id}
              channel={channel}
              threads={channelThreads}
              isActive={isChannelActive}
              expanded={expandedChannels.has(channel.id) || channelThreads.some((t) => selectedView?.type === 'thread' && selectedView.id === t.id)}
              onToggleExpand={() => toggleExpand(channel.id)}
              onSelect={() => onSelectChannel(channel.id)}
              onDelete={() => onDeleteChannel(channel.id)}
              selectedThreadId={
                selectedView?.type === 'thread' && selectedView.channelId === channel.id
                  ? selectedView.id
                  : null
              }
              onSelectThread={(threadId) => onSelectThread(threadId, channel.id)}
              onDeleteThread={(threadId) => onDeleteThread(threadId, channel.id)}
              onCreateThread={onCreateThread}
              disabled={loading}
            />
          )
        })}
      </div>
    </aside>
  )
}
