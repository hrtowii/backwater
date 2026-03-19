import { invoke } from '@tauri-apps/api/core'

export type Channel = {
  id: number
  name: string
  created_at_ms: number
}

export type Message = {
  id: number
  channel_id: number
  content: string
  media_url: string | null
  created_at_ms: number
  updated_at_ms: number
}

export type Pinned = {
  message_id: number
  channel_id: number
  pinned_at_ms: number
}

export type ListMessagesInput = {
  channel_id: number
  from_ms?: number
  to_ms?: number
}

export type SearchMessagesInput = {
  channel_id: number
  query: string
  from_ms?: number
  to_ms?: number
}

export type Settings = {
  id: number
  theme_preset: string
  custom_colors: string | null
  updated_at: number
}

export type CustomColors = {
  base?: string
  surface?: string
  overlay?: string
  muted?: string
  subtle?: string
  text?: string
  love?: string
  gold?: string
  rose?: string
  pine?: string
  foam?: string
  iris?: string
  highlightLow?: string
  highlightMed?: string
  highlightHigh?: string
}

export type MediaFileData = {
  data: Uint8Array
  mimeType: string
}

export type UpdateSettingsInput = {
  theme_preset: string
  custom_colors?: CustomColors | null
}

export const api = {
  healthcheck: () => invoke<string>('healthcheck'),
  listChannels: () => invoke<Channel[]>('list_channels'),
  createChannel: (name: string) => invoke<Channel>('create_channel', { input: { name } }),
  deleteChannel: (channelId: number) => invoke<void>('delete_channel', { channelId }),
  listMessages: (input: ListMessagesInput) =>
    invoke<Message[]>('list_messages', { input }),
  searchMessages: (input: SearchMessagesInput) =>
    invoke<Message[]>('search_messages', { input }),
  createMessage: (channelId: number, content: string, mediaUrl?: string | null) =>
    invoke<Message>('create_message', {
      input: {
        channel_id: channelId,
        content,
        media_url: mediaUrl ?? null,
      },
    }),
  updateMessage: (id: number, content: string, mediaUrl?: string | null) =>
    invoke<Message>('update_message', {
      input: {
        id,
        content,
        media_url: mediaUrl ?? null,
      },
    }),
  deleteMessage: (messageId: number) => invoke<void>('delete_message', { messageId }),
  pinMessage: (messageId: number, channelId: number) =>
    invoke<Pinned>('pin_message', { input: { message_id: messageId, channel_id: channelId } }),
  unpinMessage: (messageId: number, channelId: number) =>
    invoke<void>('unpin_message', { input: { message_id: messageId, channel_id: channelId } }),
  listPinned: (channelId: number) => invoke<Pinned[]>('list_pinned', { channelId }),
  getSettings: () => invoke<Settings>('get_settings'),
  updateSettings: (input: UpdateSettingsInput) => invoke<Settings>('update_settings', { input }),
  saveMediaFile: (sourcePath: string) => invoke<string>('save_media_file', { sourcePath }),
  readMediaFile: (relativePath: string) => invoke<MediaFileData>('read_media_file', { relativePath }),
}
