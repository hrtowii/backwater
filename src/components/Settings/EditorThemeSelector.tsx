import { bundledThemesInfo } from 'shiki/themes'

interface EditorThemeSelectorProps {
  tempEditorTheme: string
  loading: boolean
  saving: boolean
  onEditorThemeChange: (value: string) => void
  onSave: () => void
  onReset: () => void
}

const darkThemes = bundledThemesInfo.filter((t) => t.type === 'dark')
const lightThemes = bundledThemesInfo.filter((t) => t.type === 'light')

export default function EditorThemeSelector({
  tempEditorTheme,
  loading,
  saving,
  onEditorThemeChange,
  onSave,
  onReset,
}: EditorThemeSelectorProps) {
  return (
    <section className="rounded-lg border border-overlay bg-surface/65 p-5">
      <h2 className="text-xl font-semibold">Editor Theme</h2>
      <p className="mt-1 text-sm text-subtle">Choose a syntax highlighting theme for code blocks</p>

      <div className="mt-4">
        <select
          value={tempEditorTheme}
          onChange={(e) => onEditorThemeChange(e.target.value)}
          className="w-full rounded-md border border-overlay bg-base px-3 py-2 text-sm focus:border-rose focus:outline-none"
          disabled={loading || saving}
        >
          <optgroup label="Dark">
            {darkThemes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.displayName}
              </option>
            ))}
          </optgroup>
          <optgroup label="Light">
            {lightThemes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.displayName}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={onSave}
          disabled={loading || saving}
          className="rounded-md border border-rose/70 bg-overlay px-4 py-2 text-sm font-semibold transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={onReset}
          disabled={loading || saving}
          className="rounded-md border border-overlay bg-surface px-4 py-2 text-sm transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </section>
  )
}
