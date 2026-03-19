-- Settings table for storing user preferences
-- Uses a single-row design (id always = 1)

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  theme_preset TEXT NOT NULL DEFAULT 'rose_pine_main',
  custom_colors TEXT,
  updated_at INTEGER NOT NULL
);

-- Insert default settings
INSERT INTO settings (id, theme_preset, custom_colors, updated_at)
VALUES (
  1,
  'rose_pine_main',
  NULL,
  strftime('%s', 'now') * 1000
);
