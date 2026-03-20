CREATE TABLE IF NOT EXISTS threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL,
  FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_threads_channel
  ON threads(channel_id);

ALTER TABLE messages ADD COLUMN thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE;
