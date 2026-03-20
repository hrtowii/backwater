import { useEffect, useState, useRef } from 'react'
import type { Message as MessageType } from '../../lib/api'
import { api } from '../../lib/api'
import { useTheme } from '../../contexts/ThemeContext'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ShikiHighlighter, { isInlineCode } from "react-shiki";

interface MessageProps {
  message: MessageType
  isPinned: boolean
  onTogglePin: () => void
  onDelete: () => void
  onUpdated: () => void
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
const CodeHighlight = ({ className, children, node, ...props }) => {
  const code = String(children).trim();
  const match = className?.match(/language-(\w+)/);
  const language = match ? match[1] : undefined;
  const isInline = node ? isInlineCode(node) : undefined;
  const { editorTheme } = useTheme()

  return !isInline ? (
    <ShikiHighlighter language={language} theme={editorTheme} {...props}>
      {code}
    </ShikiHighlighter>
  ) : (
    <code className={className} {...props}>
      {code}
    </code>
  );
};

export default function Message({ message, isPinned, onTogglePin, onDelete, onUpdated, disabled }: MessageProps) {
  const [pinVisible, setPinVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const pinTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [editHeight, setEditHeight] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(editText.length, editText.length)
    }
  }, [isEditing])

  function handleStartEdit() {
    setEditHeight(contentRef.current?.clientHeight ?? null)
    setEditText(message.content)
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setEditText('')
    setEditHeight(null)
  }

  async function handleSaveEdit() {
    const content = editText.trim()
    if (!content) return

    try {
      await api.updateMessage(message.id, content, message.media_url)
      setIsEditing(false)
      setEditText('')
      setEditHeight(null)
      onUpdated()
    } catch (err) {
      console.error('Failed to update message:', err)
    }
  }

  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      handleCancelEdit()
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSaveEdit()
    }
  }

  function handleMouseEnter() {
    if (pinTimer.current) clearTimeout(pinTimer.current)
    if (deleteTimer.current) clearTimeout(deleteTimer.current)
    if (editTimer.current) clearTimeout(editTimer.current)
    pinTimer.current = setTimeout(() => setPinVisible(true), 0)
    deleteTimer.current = setTimeout(() => setDeleteVisible(true), 100)
    editTimer.current = setTimeout(() => setEditVisible(true), 100)
  }

  function handleMouseLeave() {
    if (pinTimer.current) clearTimeout(pinTimer.current)
    if (deleteTimer.current) clearTimeout(deleteTimer.current)
    if (editTimer.current) clearTimeout(editTimer.current)
    deleteTimer.current = setTimeout(() => setDeleteVisible(false), 0)
    pinTimer.current = setTimeout(() => setPinVisible(false), 100)
    editTimer.current = setTimeout(() => setEditVisible(false), 100)
  }

  useEffect(() => {
    return () => {
      if (pinTimer.current) clearTimeout(pinTimer.current)
      if (deleteTimer.current) clearTimeout(deleteTimer.current)
      if (editTimer.current) clearTimeout(editTimer.current)
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
        {isEditing ? (
          <div className="mt-2">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              style={editHeight ? { height: editHeight } : undefined}
              className="w-full resize-y rounded-md border border-overlay bg-base px-3 py-2 text-sm text-text placeholder:text-muted focus:border-rose focus:outline-none"
              rows={3}
              maxLength={10_000}
            />
            <p className="mt-1 text-xs text-subtle">esc to cancel, enter to save</p>
          </div>
        ) : (
          <div ref={contentRef} className="prose prose-sm dark:prose-invert max-w-none mt-2
      prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0
      prose-code:before:content-none prose-code:after:content-none">
            <Markdown remarkPlugins={[remarkGfm]} components={{ code: CodeHighlight }}>{message.content}</Markdown>
          </div>
        )}
      </div>

      {!isEditing && (
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
            style={btnStyle(editVisible)}
            className="rounded-md border border-iris/70 bg-overlay px-3 py-1.5 text-sm font-semibold hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleStartEdit}
            disabled={disabled}
          >
            edit
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
      )}
    </article>
  )
}
