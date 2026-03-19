import { useEffect, useState, useRef } from 'react'
import type { Message as MessageType } from '../../lib/api'
import { api } from '../../lib/api'

interface MessageProps {
  message: MessageType
  isPinned: boolean
  onTogglePin: () => void
  onDelete: () => void
  disabled: boolean
}

function MediaDisplay({ mediaUrl }: { mediaUrl: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMedia() {
      try {
        setLoading(true)
        setError(null)
        const mediaData = await api.readMediaFile(mediaUrl)
        console.log(mediaData)
        const blob = new Blob([mediaData.data], { type: mediaData.mimeType })
        const url = URL.createObjectURL(blob)
        setObjectUrl(url)
      } catch (err) {
        console.log(err);
        setError(err instanceof Error ? err.message : 'Failed to load media')
      } finally {
        setLoading(false)
      }
    }

    loadMedia()

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [mediaUrl])

  if (loading) {
    return <div className="mt-2 text-sm text-muted">Loading media...</div>
  }

  if (error) {
    return <div className="mt-2 text-sm text-love">{error}</div>
  }

  if (!objectUrl) {
    return null
  }

  if (mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return (
      <img
        src={objectUrl}
        alt="Message media"
        className="mt-2 max-h-96 w-full rounded-md object-contain"
      />
    )
  }

  if (mediaUrl.match(/\.(mp4|webm|mov|avi)$/i)) {
    return (
      <video
        src={objectUrl}
        controls
        className="mt-2 max-h-96 w-full rounded-md"
      />
    )
  }

  const fileName = mediaUrl.split('/').pop() || 'file'
  return (
    <a
      href={objectUrl}
      download={fileName}
      className="mt-2 inline-flex items-center gap-2 rounded-md border border-foam bg-surface px-3 py-2 text-sm text-foam transition hover:bg-overlay"
    >
      📎 {fileName}
    </a>
  )
}

export default function Message({ message, isPinned, onTogglePin, onDelete, disabled }: MessageProps) {
  const [pinVisible, setPinVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const pinTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    if (pinTimer.current) clearTimeout(pinTimer.current)
    if (deleteTimer.current) clearTimeout(deleteTimer.current)
    pinTimer.current = setTimeout(() => setPinVisible(true), 0)
    deleteTimer.current = setTimeout(() => setDeleteVisible(true), 100)
  }

  function handleMouseLeave() {
    if (pinTimer.current) clearTimeout(pinTimer.current)
    if (deleteTimer.current) clearTimeout(deleteTimer.current)
    deleteTimer.current = setTimeout(() => setDeleteVisible(false), 0)
    pinTimer.current = setTimeout(() => setPinVisible(false), 100)
  }

  useEffect(() => {
    return () => {
      if (pinTimer.current) clearTimeout(pinTimer.current)
      if (deleteTimer.current) clearTimeout(deleteTimer.current)
    }
  }, [])

  const btnStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px)' : 'translateY(6px)',
    transition: 'opacity 180ms ease-out, transform 180ms ease-out',
    pointerEvents: visible ? 'auto' : 'none',
  })

  return (
    <article
      className="group relative rounded-none border border-overlay bg-surface/65 p-3 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.7)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pr-16">
        <div className="flex flex-wrap justify-between gap-2 text-xs text-subtle">
          <span>{new Date(message.created_at_ms).toLocaleString()}</span>
        </div>
        {message.media_url && <MediaDisplay mediaUrl={message.media_url} />}
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">{message.content}</p>
      </div>

      <div className="absolute right-3 top-3 flex gap-2">
        <button
          type="button"
          style={btnStyle(pinVisible)}
          className="rounded-md border border-iris/70 bg-overlay px-3 py-1.5 text-sm font-semibold hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onTogglePin}
          disabled={disabled}
        >
          {isPinned ? 'unpin' : 'pin'}
        </button>
        <button
          type="button"
          style={btnStyle(deleteVisible)}
          className="rounded-md border border-love/70 bg-love/20 px-3 py-1.5 text-sm hover:bg-love/30 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onDelete}
          disabled={disabled}
        >
          delete
        </button>
      </div>
    </article>
  )
}
