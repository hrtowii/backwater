import { useEffect, useMemo, useState, useRef } from 'react'
import { api, type Channel, type Message, type Pinned, type Thread, type SelectedView } from '../../lib/api'
import { dateStartMs, dateEndMs, formatError } from './utils'
import ChannelSidebar from './ChannelSidebar'
import MessageFilters from './MessageFilters'
import MessageComposer from './MessageComposer'
import MessageList from './MessageList'

export default function AppHome() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [threads, setThreads] = useState<Map<number, Thread[]>>(new Map())
  const [selectedView, setSelectedView] = useState<SelectedView | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [pinned, setPinned] = useState<Pinned[]>([])
  const [channelName, setChannelName] = useState('#')
  const [composerText, setComposerText] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimerRef = useRef<number | null>(null)

  const pinnedSet = useMemo(
    () => new Set(pinned.map((item) => item.message_id)),
    [pinned],
  )

  const selectedChannelId = useMemo(() => {
    if (selectedView === null) return null
    if (selectedView.type === 'channel') return selectedView.id
    return selectedView.channelId
  }, [selectedView])

  const headerTitle = useMemo(() => {
    if (selectedView === null) return 'select channel'
    const channel = channels.find((c) => c.id === selectedView.id) ?? null
    if (selectedView.type === 'channel') {
      return channel?.name ?? 'select channel'
    }
    const channelThreads = threads.get(selectedView.channelId) ?? []
    const thread = channelThreads.find((t) => t.id === selectedView.id)
    const channelName = channels.find((c) => c.id === selectedView.channelId)?.name ?? ''
    return `${channelName} / ${thread?.name ?? ''}`
  }, [selectedView, channels, threads])

  useEffect(() => {
    void refreshChannels()
  }, [])

  useEffect(() => {
    if (selectedView === null) {
      setMessages([])
      setPinned([])
      return
    }

    void refreshMessages()
    void refreshPinned()
  }, [selectedView])

  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
    }

    if (selectedView === null) {
      return
    }

    debounceTimerRef.current = window.setTimeout(() => {
      void refreshMessages()
    }, 300)

    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchText, fromDate, toDate, selectedView])

  async function refreshChannels() {
    try {
      setError(null)
      const result = await api.listChannels()
      setChannels(result)

      if (result.length === 0) {
        setSelectedView(null)
        return
      }

      // Load threads for all channels
      await refreshAllThreads(result)

      setSelectedView((current) => {
        if (current) {
          if (current.type === 'channel' && result.some((ch) => ch.id === current.id)) {
            return current
          }
          if (current.type === 'thread') {
            // Verify the channel still exists
            if (result.some((ch) => ch.id === current.channelId)) {
              return current
            }
          }
        }
        return { type: 'channel', id: result[0].id }
      })
    } catch (err) {
      setError(formatError(err))
    }
  }

  async function refreshAllThreads(channelList: Channel[]) {
    const newThreads = new Map<number, Thread[]>()
    for (const channel of channelList) {
      try {
        const threadList = await api.listThreads(channel.id)
        newThreads.set(channel.id, threadList)
      } catch {
        newThreads.set(channel.id, [])
      }
    }
    setThreads(newThreads)
  }

  async function refreshThreadsForChannel(channelId: number) {
    try {
      const threadList = await api.listThreads(channelId)
      setThreads((prev) => {
        const next = new Map(prev)
        next.set(channelId, threadList)
        return next
      })
    } catch {
      // ignore
    }
  }

  async function refreshMessages() {
    if (selectedView === null) {
      return
    }

    try {
      setError(null)
      const fromMs = fromDate ? dateStartMs(fromDate) : undefined
      const toMs = toDate ? dateEndMs(toDate) : undefined

      const channelId = selectedView.type === 'channel' ? selectedView.id : selectedView.channelId
      const threadId = selectedView.type === 'thread' ? selectedView.id : undefined

      const result = searchText.trim()
        ? await api.searchMessages({
          channel_id: channelId,
          thread_id: threadId,
          query: searchText,
          from_ms: fromMs,
          to_ms: toMs,
        })
        : await api.listMessages({
          channel_id: channelId,
          thread_id: threadId,
          from_ms: fromMs,
          to_ms: toMs,
        })

      setMessages(result)
    } catch (err) {
      setError(formatError(err))
    }
  }

  function handleImmediateSearch() {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    void refreshMessages()
  }

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
      setSelectedView({ type: 'channel', id: newChannel.id })
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
      if (selectedView !== null) {
        if (
          (selectedView.type === 'channel' && selectedView.id === channelId) ||
          (selectedView.type === 'thread' && selectedView.channelId === channelId)
        ) {
          setSelectedView(null)
        }
      }
      await refreshChannels()
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateThread(channelId: number, name: string) {
    try {
      setLoading(true)
      setError(null)
      const newThread = await api.createThread({ channel_id: channelId, name })
      await refreshThreadsForChannel(channelId)
      setSelectedView({ type: 'thread', id: newThread.id, channelId })
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteThread(threadId: number, channelId: number) {
    try {
      setLoading(true)
      setError(null)
      await api.deleteThread(threadId)
      if (selectedView?.type === 'thread' && selectedView.id === threadId) {
        setSelectedView({ type: 'channel', id: channelId })
      }
      await refreshThreadsForChannel(channelId)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  function handleSelectChannel(channelId: number) {
    setSelectedView({ type: 'channel', id: channelId })
  }

  function handleSelectThread(threadId: number, channelId: number) {
    setSelectedView({ type: 'thread', id: threadId, channelId })
  }

  async function handleCreateMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selectedView === null) {
      return
    }

    const content = composerText.trim()
    if (!content) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const channelId = selectedView.type === 'channel' ? selectedView.id : selectedView.channelId
      const threadId = selectedView.type === 'thread' ? selectedView.id : undefined
      await api.createMessage({
        channel_id: channelId,
        thread_id: threadId,
        content,
        media_url: mediaUrl,
      })
      setComposerText('')
      setMediaUrl(null)
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
      if (content && selectedView !== null) {
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
          threads={threads}
          selectedView={selectedView}
          channelName={channelName}
          onChannelNameChange={setChannelName}
          onCreateChannel={handleCreateChannel}
          onSelectChannel={handleSelectChannel}
          onDeleteChannel={handleDeleteChannel}
          onSelectThread={handleSelectThread}
          onDeleteThread={handleDeleteThread}
          onCreateThread={handleCreateThread}
          loading={loading}
        />

        <main className="p-4 md:p-6 flex flex-col h-screen">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl tracking-wide sm:text-2xl md:text-3xl">
              {headerTitle}
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

          <div className='flex flex-col w-full space-between flex-1 min-h-0'>
            <MessageList
              messages={messages}
              pinnedSet={pinnedSet}
              onTogglePin={handleTogglePin}
              onDeleteMessage={handleDeleteMessage}
              onMessageUpdated={refreshMessages}
              loading={loading}
              selectedChannelId={selectedChannelId}
            />
            <div className="sticky bottom-0 bg-background pt-2">

              <MessageComposer
                composerText={composerText}
                mediaUrl={mediaUrl}
                onComposerTextChange={setComposerText}
                onMediaUrlChange={setMediaUrl}
                onSubmit={handleCreateMessage}
                onKeyDown={handleMessageKeyDown}
                disabled={loading || selectedView === null}
              />
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
