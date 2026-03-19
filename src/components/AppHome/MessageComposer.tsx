interface MessageComposerProps {
  composerText: string
  onComposerTextChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  disabled: boolean
}

export default function MessageComposer({
  composerText,
  onComposerTextChange,
  onSubmit,
  onKeyDown,
  disabled,
}: MessageComposerProps) {
  return (
    <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
      <textarea
        value={composerText}
        onChange={(event) => onComposerTextChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="send...."
        className="min-h-28 rounded-md border border-overlay bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-rose focus:outline-none"
        maxLength={10_000}
      />
      <button
        type="submit"
        className="rounded-md border border-rose/70 bg-overlay px-4 py-2 text-sm font-semibold tracking-wide transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
      >
        send
      </button>
    </form>
  )
}
