-- Add editor_theme column for syntax highlighting theme selection
ALTER TABLE settings ADD COLUMN editor_theme TEXT NOT NULL DEFAULT 'rose-pine';
