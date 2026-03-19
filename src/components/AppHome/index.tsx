import { useEffect, useMemo, useState, useRef } from 'react'
import { api, type Channel, type Message, type Pinned } from '../../lib/api'
import { dateStartMs, dateEndMs, formatError } from './utils'
import ChannelSidebar from './ChannelSidebar'
import MessageFilters from './MessageFilters'
import MessageComposer from './MessageComposer'
import MessageList from './MessageList'

export default function AppHome() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [pinned, setPinned] = useState<Pinned[]>([])
  const [channelName, setChannelName] = useState('#')
  const [composerText, setComposerText] = useState('')
  const [searchText, setSearchText] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce timer ref
  const debounceTimerRef = useRef<number | null>(null)

  const pinnedSet = useMemo(
    () => new Set(pinned.map((item) => item.message_id)),
    [pinned],
  )

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId],
  )

  useEffect(() => {
    void refreshChannels()
  }, [])

  useEffect(() => {
    if (selectedChannelId === null) {
      setMessages([])
      setPinned([])
      return
    }

    void refreshMessages()
    void refreshPinned()
  }, [selectedChannelId])

  // Live search with debounce: trigger search when searchText, fromDate, or toDate change
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
    }

    // Don't search if no channel is selected
    if (selectedChannelId === null) {
      return
    }

    // Set up new debounce timer (300ms)
    debounceTimerRef.current = window.setTimeout(() => {
      void refreshMessages()
    }, 300)

    // Cleanup function
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchText, fromDate, toDate, selectedChannelId])

  async function refreshChannels() {
    try {
      setError(null)
      const result = await api.listChannels()
      setChannels(result)

      if (result.length === 0) {
        setSelectedChannelId(null)
        return
      }

      setSelectedChannelId((current) => {
        if (current && result.some((channel) => channel.id === current)) {
          return current
        }

        return result[0]?.id ?? null
      })
    } catch (err) {
      setError(formatError(err))
    }
  }

  async function refreshMessages() {
    if (selectedChannelId === null) {
      return
    }

    try {
      setError(null)
      const fromMs = fromDate ? dateStartMs(fromDate) : undefined
      const toMs = toDate ? dateEndMs(toDate) : undefined

      const result = searchText.trim()
        ? await api.searchMessages({
          channel_id: selectedChannelId,
          query: searchText,
          from_ms: fromMs,
          to_ms: toMs,
        })
        : await api.listMessages({
          channel_id: selectedChannelId,
          from_ms: fromMs,
          to_ms: toMs,
        })

      setMessages(result)
    } catch (err) {
      setError(formatError(err))
    }
  }

  // Handle immediate search (bypassing debounce) for Enter key and Apply button
  function handleImmediateSearch() {
    // Clear any pending debounce timer
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    // Trigger search immediately
    void refreshMessages()
  }

  // Handle Enter key press in search input
  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleImmediateSearch()
    }
  }

  async function refreshPinned() {
    if (selectedChannelId === null) {
      return
    }

    try {
      setError(null)
      const result = await api.listPinned(selectedChannelId)
      setPinned(result)
    } catch (err) {
      setError(formatError(err))
    }
  }

  async function handleCreateChannel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    let name = channelName.trim()
    // Remove trailing dashes before sending to DB
    name = name.replace(/-+$/, '')
    if (!name || name === '#') {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const newChannel = await api.createChannel(name)
      setChannelName('#')
      await refreshChannels()
      setSelectedChannelId(newChannel.id)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteChannel(channelId: number) {
    try {
      setLoading(true)
      setError(null)
      await api.deleteChannel(channelId)
      await refreshChannels()
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selectedChannelId === null) {
      return
    }

    const content = composerText.trim()
    if (!content) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      await api.createMessage(selectedChannelId, content, null)
      setComposerText('')
      await refreshMessages()
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  function handleMessageKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      const content = composerText.trim()
      if (content && selectedChannelId !== null) {
        void handleCreateMessage(event as any)
      }
    }
  }

  async function handleDeleteMessage(messageId: number) {
    try {
      setLoading(true)
      setError(null)
      await api.deleteMessage(messageId)
      await refreshMessages()
      await refreshPinned()
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleTogglePin(messageId: number) {
    if (selectedChannelId === null) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (pinnedSet.has(messageId)) {
        await api.unpinMessage(messageId, selectedChannelId)
      } else {
        await api.pinMessage(messageId, selectedChannelId)
      }

      await refreshPinned()
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-text">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 md:grid-cols-[290px_1fr]">
        <ChannelSidebar
          channels={channels}
          selectedChannelId={selectedChannelId}
          channelName={channelName}
          onChannelNameChange={setChannelName}
          onCreateChannel={handleCreateChannel}
          onSelectChannel={setSelectedChannelId}
          onDeleteChannel={handleDeleteChannel}
          loading={loading}
        />

        <main className="p-4 md:p-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl tracking-wide sm:text-2xl md:text-3xl">
              {selectedChannel?.name ?? 'Select a channel'}
            </h2>

            <MessageFilters
              searchText={searchText}
              fromDate={fromDate}
              toDate={toDate}
              onSearchChange={setSearchText}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onApply={handleImmediateSearch}
              onSearchKeyDown={handleSearchKeyDown}
            />
          </header>

          {error ? <p className="mt-3 text-sm text-love">{error}</p> : null}

          <MessageComposer
            composerText={composerText}
            onComposerTextChange={setComposerText}
            onSubmit={handleCreateMessage}
            onKeyDown={handleMessageKeyDown}
            disabled={loading || selectedChannelId === null}
          />

          <MessageList
            messages={messages}
            pinnedSet={pinnedSet}
            onTogglePin={handleTogglePin}
            onDeleteMessage={handleDeleteMessage}
            loading={loading}
            selectedChannelId={selectedChannelId}
          />
        </main>
      </div>
    </div>
  )
}
