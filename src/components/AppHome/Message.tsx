import type { Message as MessageType } from '../../lib/api'

interface MessageProps {
  message: MessageType
  isPinned: boolean
  onTogglePin: () => void
  onDelete: () => void
  disabled: boolean
}

export default function Message({ message, isPinned, onTogglePin, onDelete, disabled }: MessageProps) {
  return (
    <article className="group relative rounded-lg border border-overlay bg-surface/65 p-3 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.7)]">
      <div className="pr-16">
        <div className="flex flex-wrap justify-between gap-2 text-xs text-subtle">
          <span>{new Date(message.created_at_ms).toLocaleString()}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">{message.content}</p>
      </div>
      <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          type="button"
          className="rounded-md border border-iris/70 bg-overlay px-3 py-1.5 text-sm font-semibold transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onTogglePin}
          disabled={disabled}
        >
          {isPinned ? 'unpin' : 'pin'}
        </button>
        <button
          type="button"
          className="rounded-md border border-love/70 bg-love/20 px-3 py-1.5 text-sm transition hover:bg-love/30 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onDelete}
          disabled={disabled}
        >
          delete
        </button>
      </div>
    </article>
  )
}
