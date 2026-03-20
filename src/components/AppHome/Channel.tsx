import { useState } from 'react'
import type { Channel as ChannelType, Thread as ThreadType } from '../../lib/api'

interface ChannelProps {
  channel: ChannelType
  threads: ThreadType[]
  isActive: boolean
  expanded: boolean
  onToggleExpand: () => void
  onSelect: () => void
  onDelete: () => void
  selectedThreadId: number | null
  onSelectThread: (threadId: number) => void
  onDeleteThread: (threadId: number) => void
  onCreateThread: (channelId: number, name: string) => void
  disabled: boolean
}

export default function Channel({
  channel,
  threads,
  isActive,
  expanded,
  onToggleExpand,
  onSelect,
  onDelete,
  selectedThreadId,
  onSelectThread,
  onDeleteThread,
  onCreateThread,
  disabled,
}: ChannelProps) {
  const [hovered, setHovered] = useState(false)
  const [showThreadInput, setShowThreadInput] = useState(false)
  const [threadName, setThreadName] = useState('')
  const [threadHoveredId, setThreadHoveredId] = useState<number | null>(null)

  function handleCreateThread(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    const name = threadName.trim()
    if (!name) return
    onCreateThread(channel.id, name)
    setThreadName('')
    setShowThreadInput(false)
  }

  return (
    <div>
      <div
        className="flex w-full items-stretch gap-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {threads.length > 0 ? (
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
          <span className="shrink-0 px-1 text-transparent">▸</span>
        )}
        <button
          type="button"
          className={`min-w-0 flex-1 rounded-md border px-3 py-2 text-left text-sm transition ${
            isActive && selectedThreadId === null
              ? 'border-rose bg-overlay font-semibold'
              : 'border-overlay bg-surface'
          }`}
          onClick={onSelect}
        >
          {channel.name}
        </button>
        {hovered && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowThreadInput(!showThreadInput)
            }}
            disabled={disabled}
            title="Add thread"
            className="self-stretch shrink-0 rounded-md border border-overlay bg-surface px-1.5 text-sm transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
          >
            +
          </button>
        )}
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

      {showThreadInput && (
        <form onSubmit={handleCreateThread} className="ml-7 mt-1 flex gap-1">
          <input
            value={threadName}
            onChange={(e) => setThreadName(e.target.value)}
            placeholder="thread name"
            className="min-w-0 flex-1 rounded-md border border-overlay bg-surface px-2 py-1 text-xs outline-none ring-0 placeholder:text-muted focus:border-rose"
            maxLength={80}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="submit"
            disabled={disabled}
            className="rounded-md border border-rose/70 bg-overlay px-2 py-1 text-xs font-semibold transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
          >
            add
          </button>
        </form>
      )}

      {expanded && threads.length > 0 && (
        <div className="ml-7 mt-1 space-y-1">
          {threads.map((thread) => {
            const isThreadActive = isActive && selectedThreadId === thread.id
            return (
              <div
                key={thread.id}
                className="flex items-stretch gap-2"
                onMouseEnter={() => setThreadHoveredId(thread.id)}
                onMouseLeave={() => setThreadHoveredId(null)}
              >
                <button
                  type="button"
                  className={`min-w-0 flex-1 rounded-md border px-3 py-1.5 text-left text-xs transition ${
                    isThreadActive
                      ? 'border-rose bg-overlay font-semibold'
                      : 'border-overlay bg-surface'
                  }`}
                  onClick={() => onSelectThread(thread.id)}
                >
                  {thread.name}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteThread(thread.id)}
                  disabled={disabled}
                  aria-label={`Delete thread ${thread.name}`}
                  className="self-stretch shrink-0 rounded-md border border-love/70 bg-love/20 text-xs hover:bg-love/30 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
                  style={{
                    width: threadHoveredId === thread.id ? '1.75rem' : '0',
                    opacity: threadHoveredId === thread.id ? 1 : 0,
                    transition: 'width 180ms ease-out, opacity 180ms ease-out',
                    pointerEvents: threadHoveredId === thread.id ? 'auto' : 'none',
                    padding: threadHoveredId === thread.id ? undefined : '0',
                  }}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
