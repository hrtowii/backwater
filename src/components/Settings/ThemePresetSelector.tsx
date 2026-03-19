import type { ThemePreset } from '../../contexts/ThemeContext'

interface ThemePresetSelectorProps {
  tempPreset: ThemePreset
  loading: boolean
  saving: boolean
  onPresetChange: (preset: ThemePreset) => void
  onSave: () => void
  onReset: () => void
}

export default function ThemePresetSelector({
  tempPreset,
  loading,
  saving,
  onPresetChange,
  onSave,
  onReset,
}: ThemePresetSelectorProps) {
  return (
    <section className="rounded-lg border border-overlay bg-surface/65 p-5">
      <h2 className="text-xl font-semibold">Theme Preset</h2>
      <p className="mt-1 text-sm text-subtle">Choose a pre-configured color scheme</p>

      <div className="mt-4">
        <select
          value={tempPreset}
          onChange={(e) => onPresetChange(e.target.value as ThemePreset)}
          className="w-full rounded-md border border-overlay bg-base px-3 py-2 text-sm focus:border-rose focus:outline-none"
          disabled={loading || saving}
        >
          <option value="rose_pine_main">Rosé Pine (Main)</option>
          <option value="rose_pine_moon">Rosé Pine Moon</option>
          <option value="rose_pine_dawn">Rosé Pine Dawn</option>
          <option value="ocean">Ocean (Original)</option>
          <option value="custom">Custom</option>
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
