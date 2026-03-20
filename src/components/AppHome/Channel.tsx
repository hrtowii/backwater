import { useState } from 'react'
import type { Channel as ChannelType, Thread as ThreadType } from '../../lib/api'
import ChannelRow from './ChannelRow'
import ThreadInput from './ThreadInput'
import ThreadList from './ThreadList'

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
  const [showThreadInput, setShowThreadInput] = useState(false)

  function handleCreateThread(name: string) {
    onCreateThread(channel.id, name)
    setShowThreadInput(false)
  }

  return (
    <div>
      <ChannelRow
        channel={channel}
        isActive={isActive}
        selectedThreadId={selectedThreadId}
        onToggleExpand={onToggleExpand}
        expanded={expanded}
        hasThreads={threads.length > 0}
        onSelect={onSelect}
        onDelete={onDelete}
        onToggleThreadInput={() => setShowThreadInput(!showThreadInput)}
        disabled={disabled}
      />

      {showThreadInput && (
        <ThreadInput onCreate={handleCreateThread} disabled={disabled} />
      )}

      {expanded && (
        <ThreadList
          threads={threads}
          isActive={isActive}
          selectedThreadId={selectedThreadId}
          onSelectThread={onSelectThread}
          onDeleteThread={onDeleteThread}
          disabled={disabled}
        />
      )}
    </div>
  )
}
