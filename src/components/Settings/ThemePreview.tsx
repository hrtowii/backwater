import type { CustomColors } from '../../lib/api'

interface ThemePreviewProps {
  getCurrentColor: (key: keyof CustomColors) => string
}

const colorFields: Array<{ key: keyof CustomColors; label: string }> = [
  { key: 'base', label: 'Base' },
  { key: 'surface', label: 'Surface' },
  { key: 'overlay', label: 'Overlay' },
  { key: 'muted', label: 'Muted' },
  { key: 'subtle', label: 'Subtle' },
  { key: 'text', label: 'Text' },
  { key: 'love', label: 'Love' },
  { key: 'gold', label: 'Gold' },
  { key: 'rose', label: 'Rose' },
  { key: 'pine', label: 'Pine' },
  { key: 'foam', label: 'Foam' },
  { key: 'iris', label: 'Iris' },
  { key: 'highlightLow', label: 'Highlight Low' },
  { key: 'highlightMed', label: 'Highlight Med' },
  { key: 'highlightHigh', label: 'Highlight High' },
]

export default function ThemePreview({ getCurrentColor }: ThemePreviewProps) {
  return (
    <section className="rounded-lg border border-overlay bg-surface/65 p-5">
      <h2 className="text-xl font-semibold">Current Theme</h2>
      <p className="mt-1 text-sm text-subtle">Preview your active color scheme</p>

      <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">
        {colorFields.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <div
              className="h-12 w-full rounded border border-overlay"
              style={{ backgroundColor: getCurrentColor(key) }}
            />
            <p className="text-xs text-subtle">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
