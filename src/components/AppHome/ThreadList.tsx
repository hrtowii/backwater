import { useState } from 'react'
import type { Thread as ThreadType } from '../../lib/api'

interface ThreadListProps {
  threads: ThreadType[]
  isActive: boolean
  selectedThreadId: number | null
  onSelectThread: (threadId: number) => void
  onDeleteThread: (threadId: number) => void
  disabled: boolean
}

export default function ThreadList({
  threads,
  isActive,
  selectedThreadId,
  onSelectThread,
  onDeleteThread,
  disabled,
}: ThreadListProps) {
  const [threadHoveredId, setThreadHoveredId] = useState<number | null>(null)

  if (threads.length === 0) return null

  return (
    <div className="relative ml-[1.1rem] mt-1 space-y-1">
      {/* tree line */}
      <div className="absolute left-0 top-0 bottom-2 w-px bg-subtle/40" />
      {threads.map((thread) => {
        const isThreadActive = isActive && selectedThreadId === thread.id
        const isHovered = threadHoveredId === thread.id

        return (
          <div
            key={thread.id}
            className="relative grid items-stretch gap-2"
            style={{ gridTemplateColumns: '1fr auto' }}
            onMouseEnter={() => setThreadHoveredId(thread.id)}
            onMouseLeave={() => setThreadHoveredId(null)}
          >
            {/* horizontal tick */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-px bg-subtle/40"
              style={{ left: 1 }}
            />
            <button
              type="button"
              className={`min-w-0 truncate rounded-md border px-3 py-1.5 text-left text-xs transition ml-3 ${
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
                width: isHovered ? '1.75rem' : '0',
                opacity: isHovered ? 1 : 0,
                transition: 'width 180ms ease-out, opacity 180ms ease-out',
                pointerEvents: isHovered ? 'auto' : 'none',
                padding: isHovered ? undefined : '0',
                border: isHovered ? undefined : 'none',
              }}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
