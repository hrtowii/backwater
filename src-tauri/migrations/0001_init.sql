CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  channel_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pinned (
  message_id INTEGER NOT NULL,
  channel_id INTEGER NOT NULL,
  pinned_at_ms INTEGER NOT NULL,
  PRIMARY KEY (message_id, channel_id),
  FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_channel_created
  ON messages(channel_id, created_at_ms DESC);

CREATE INDEX IF NOT EXISTS idx_messages_content
  ON messages(content);
