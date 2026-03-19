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
    <section className="mt-4 gap-3 flex-1 overflow-y-auto flex flex-col-reverse">
      {messages.map((message) => (
        <Message
          key={message.created_at_ms}
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
