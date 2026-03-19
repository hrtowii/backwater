import type { Message as MessageType } from '../../lib/api'
import Message from './Message'

interface MessageListProps {
  messages: MessageType[]
  pinnedSet: Set<number>
  onTogglePin: (messageId: number) => void
  onDeleteMessage: (messageId: number) => void
  loading: boolean
  selectedChannelId: number | null
}

export default function MessageList({
  messages,
  pinnedSet,
  onTogglePin,
  onDeleteMessage,
  loading,
  selectedChannelId,
}: MessageListProps) {
  return (
    <section className="mt-4 space-y-3">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isPinned={pinnedSet.has(message.id)}
          onTogglePin={() => onTogglePin(message.id)}
          onDelete={() => onDeleteMessage(message.id)}
          disabled={loading || selectedChannelId === null}
        />
      ))}
    </section>
  )
}
