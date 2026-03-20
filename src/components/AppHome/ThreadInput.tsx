import { useState } from 'react'

interface ThreadInputProps {
  onCreate: (name: string) => void
  disabled: boolean
}

export default function ThreadInput({ onCreate, disabled }: ThreadInputProps) {
  const [threadName, setThreadName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    const name = threadName.trim()
    if (!name) return
    onCreate(name)
    setThreadName('')
  }

  return (
    <form onSubmit={handleSubmit} className="ml-7 mt-1 flex gap-1">
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
  )
}
