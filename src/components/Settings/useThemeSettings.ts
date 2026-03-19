import { useState } from 'react'
import { useTheme, THEME_PRESETS, type ThemePreset } from '../../contexts/ThemeContext'
import type { CustomColors } from '../../lib/api'

export function useThemeSettings() {
  const { preset, customColors, setTheme, loading } = useTheme()
  const [tempPreset, setTempPreset] = useState<ThemePreset>(preset)
  const [tempColors, setTempColors] = useState<CustomColors>(customColors || {})
  const [saving, setSaving] = useState(false)

  const handlePresetChange = (newPreset: ThemePreset) => {
    setTempPreset(newPreset)
    if (newPreset !== 'custom') {
      setTempColors({})
    }
  }

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    setTempColors((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const colorsToSave = Object.keys(tempColors).length > 0 ? tempColors : null
      await setTheme(tempPreset, colorsToSave)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setTempPreset(preset)
    setTempColors(customColors || {})
  }

  const getCurrentColor = (key: keyof CustomColors): string => {
    if (tempColors[key]) return tempColors[key]
    if (tempPreset !== 'custom' && THEME_PRESETS[tempPreset]) {
      const presetColors = THEME_PRESETS[tempPreset]
      return presetColors[key]
    }
    return THEME_PRESETS.rose_pine_main[key]
  }

  const getPresetDisplayName = (preset: ThemePreset): string => {
    switch (preset) {
      case 'rose_pine_main':
        return 'Rosé Pine (Main)'
      case 'rose_pine_moon':
        return 'Rosé Pine Moon'
      case 'rose_pine_dawn':
        return 'Rosé Pine Dawn'
      case 'ocean':
        return 'Ocean (Original)'
      case 'custom':
        return 'Custom'
      default:
        return preset
    }
  }

  return {
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
  }
}
