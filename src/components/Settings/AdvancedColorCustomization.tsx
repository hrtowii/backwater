import { useState } from 'react'
import type { CustomColors } from '../../lib/api'

interface AdvancedColorCustomizationProps {
  tempColors: CustomColors
  loading: boolean
  saving: boolean
  onColorChange: (key: keyof CustomColors, value: string) => void
  onSave: () => void
  getCurrentColor: (key: keyof CustomColors) => string
  setTempPreset: (preset: 'custom') => void
  setTempColors: (colors: CustomColors) => void
}

const colorFields: Array<{ key: keyof CustomColors; label: string; description: string }> = [
  { key: 'base', label: 'Base', description: 'Main background color' },
  { key: 'surface', label: 'Surface', description: 'Cards and elevated elements' },
  { key: 'overlay', label: 'Overlay', description: 'Borders and inputs' },
  { key: 'muted', label: 'Muted', description: 'Placeholder text' },
  { key: 'subtle', label: 'Subtle', description: 'Secondary text' },
  { key: 'text', label: 'Text', description: 'Primary text' },
  { key: 'love', label: 'Love', description: 'Danger/delete actions' },
  { key: 'gold', label: 'Gold', description: 'Accent color' },
  { key: 'rose', label: 'Rose', description: 'Highlight color' },
  { key: 'pine', label: 'Pine', description: 'Info color' },
  { key: 'foam', label: 'Foam', description: 'Interactive elements' },
  { key: 'iris', label: 'Iris', description: 'Special emphasis' },
  { key: 'highlightLow', label: 'Highlight Low', description: 'Subtle highlights' },
  { key: 'highlightMed', label: 'Highlight Med', description: 'Medium highlights' },
  { key: 'highlightHigh', label: 'Highlight High', description: 'Strong highlights' },
]

export default function AdvancedColorCustomization({
  tempColors,
  loading,
  saving,
  onColorChange,
  onSave,
  getCurrentColor,
  setTempPreset,
  setTempColors,
}: AdvancedColorCustomizationProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSaveCustomColors = () => {
    setTempPreset('custom')
    onSave()
  }

  return (
    <section className="rounded-lg border border-overlay bg-surface/65 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Advanced Customization</h2>
          <p className="mt-1 text-sm text-subtle">Override individual colors</p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="rounded-md border border-overlay bg-base px-4 py-2 text-sm transition hover:bg-highlight-med"
        >
          {showAdvanced ? 'Hide' : 'Show'}
        </button>
      </div>

      {showAdvanced && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-muted">
            Custom colors will override the preset values. Leave empty to use preset defaults.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {colorFields.map(({ key, label, description }) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium">
                  {label}
                  <span className="ml-2 text-xs text-muted">({description})</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={getCurrentColor(key)}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded border border-overlay bg-base"
                    disabled={loading || saving}
                  />
                  <input
                    type="text"
                    value={tempColors[key] || ''}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    placeholder={getCurrentColor(key)}
                    className="flex-1 rounded-md border border-overlay bg-base px-3 py-2 text-sm font-mono focus:border-rose focus:outline-none"
                    disabled={loading || saving}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSaveCustomColors}
              disabled={loading || saving}
              className="rounded-md border border-rose/70 bg-overlay px-4 py-2 text-sm font-semibold transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Custom Colors'}
            </button>
            <button
              onClick={() => setTempColors({})}
              disabled={loading || saving}
              className="rounded-md border border-overlay bg-surface px-4 py-2 text-sm transition hover:bg-highlight-med disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear All Overrides
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
