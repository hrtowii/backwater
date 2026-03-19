import { Link } from '@tanstack/react-router'
import { useThemeSettings } from './useThemeSettings'
import ThemePresetSelector from './ThemePresetSelector'
import AdvancedColorCustomization from './AdvancedColorCustomization'
import ThemePreview from './ThemePreview'
import AboutSection from './AboutSection'

export default function Settings() {
  const {
    preset,
    tempPreset,
    tempColors,
    loading,
    saving,
    handlePresetChange,
    handleColorChange,
    handleSave,
    handleReset,
    getCurrentColor,
    getPresetDisplayName,
    setTempPreset,
    setTempColors,
  } = useThemeSettings()

  return (
    <div className="min-h-screen bg-transparent text-text">
      <div className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <div className="mb-4">
            <Link
              to="/splash"
              className="inline-block rounded-md border border-overlay bg-surface px-3 py-2 text-sm transition hover:bg-highlight-med"
            >
              ← Back to channels
            </Link>
          </div>
          <h1 className="font-display text-2xl leading-none tracking-wide sm:text-3xl md:text-4xl">
            Settings
          </h1>
          <p className="mt-2 text-xs text-subtle sm:text-sm">Customize your theme and appearance</p>
        </header>

        <div className="space-y-6">
          <ThemePresetSelector
            tempPreset={tempPreset}
            loading={loading}
            saving={saving}
            onPresetChange={handlePresetChange}
            onSave={handleSave}
            onReset={handleReset}
          />

          <AdvancedColorCustomization
            tempColors={tempColors}
            loading={loading}
            saving={saving}
            onColorChange={handleColorChange}
            onSave={handleSave}
            getCurrentColor={getCurrentColor}
            setTempPreset={setTempPreset}
            setTempColors={setTempColors}
          />

          <ThemePreview getCurrentColor={getCurrentColor} />

          <AboutSection preset={preset} getPresetDisplayName={getPresetDisplayName} />
        </div>
      </div>
    </div>
  )
}
