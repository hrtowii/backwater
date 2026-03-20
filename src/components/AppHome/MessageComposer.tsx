import { useEffect, useRef, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/plugin-dialog'
import { api } from '../../lib/api'

interface MessageComposerProps {
  composerText: string
  mediaUrl: string | null
  onComposerTextChange: (value: string) => void
  onMediaUrlChange: (value: string | null) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  disabled: boolean
}

export default function MessageComposer({
  composerText,
  mediaUrl,
  onComposerTextChange,
  onMediaUrlChange,
  onSubmit,
  onKeyDown,
  disabled,
}: MessageComposerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const unlisten = listen<string[]>('tauri://file-drop', async (event) => {
      const paths = event.payload
      if (paths.length > 0) {
        await handleMediaSelect(paths[0])
      }
    })

    return () => {
      unlisten.then((fn) => fn())
    }
  }, [])

  async function handleMediaSelect(filePath: string) {
    try {
      const savedPath = await api.saveMediaFile(filePath)
      onMediaUrlChange(savedPath)
    } catch (error) {
      console.error('Failed to save media file:', error)
    }
  }

  async function handleUploadClick() {
    try {
      const filePath = await open({
        multiple: false,
        title: 'Select a file',
      })
      
      if (filePath && typeof filePath === 'string') {
        await handleMediaSelect(filePath)
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error)
    }
  }

  function handleRemoveMedia() {
    onMediaUrlChange(null)
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragEnter(event: React.DragEvent) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault()
    if (event.target === formRef.current) {
      setIsDragging(false)
    }
  }

  async function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setIsDragging(false)
    
    const filePaths = event.dataTransfer.getData('text/plain')
    if (filePaths) {
      const paths = filePaths.split('\n')
      if (paths.length > 0 && paths[0]) {
        await handleMediaSelect(paths[0])
      }
    }
  }

  function getFileName(path: string | null) {
    if (!path) return null
    const parts = path.split('/')
    return parts[parts.length - 1]
  }

  const fileName = getFileName(mediaUrl)

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={`mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] rounded-md transition-colors ${
        isDragging ? 'border-2 border-dashed border-rose bg-overlay' : ''
      }`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {mediaUrl && (
        <div className="col-span-full flex items-center justify-between rounded-md border border-overlay bg-surface px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted">📎</span>
            <span className="text-text truncate">{fileName}</span>
          </div>
          <button
            type="button"
            onClick={handleRemoveMedia}
            className="rounded-md border border-love/70 bg-love/20 px-2 py-1 text-sm transition hover:bg-love/30"
            aria-label="Remove media"
          >
            x
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        <textarea
          value={composerText}
          onChange={(event) => onComposerTextChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="send..."
          className="min-h-28 rounded-md border border-overlay bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-rose focus:outline-none"
          maxLength={10_000}
        />
        <button
          type="button"
          onClick={handleUploadClick}
          className="rounded-md border border-overlay bg-surface px-4 py-2 text-sm font-semibold tracking-wide transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          aria-label="Upload media"
        >
          📁
        </button>
        <button
          type="submit"
          className="rounded-md border border-rose/70 bg-overlay px-4 py-2 text-sm font-semibold tracking-wide transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
        >
          send
        </button>
      </div>
    </form>
  )
}
