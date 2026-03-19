import type { ThemePreset } from '../../contexts/ThemeContext'

interface AboutSectionProps {
  preset: ThemePreset
  getPresetDisplayName: (preset: ThemePreset) => string
}

export default function AboutSection({ preset, getPresetDisplayName }: AboutSectionProps) {
  return (
    <section className="rounded-lg border border-overlay bg-surface/65 p-5">
      <h2 className="text-xl font-semibold">About</h2>
      <div className="mt-3 space-y-2 text-sm text-subtle">
        <p>backwater - notes-to-self channels</p>
        <p>Font: DepartureMono Nerd Font</p>
        <p>
          Theme:{' '}
          <span className="font-medium text-text">{getPresetDisplayName(preset)}</span>
        </p>
      </div>
    </section>
  )
}
