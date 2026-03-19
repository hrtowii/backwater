import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, type CustomColors } from '../lib/api'

export type ThemePreset = 'rose_pine_main' | 'rose_pine_moon' | 'rose_pine_dawn' | 'ocean' | 'custom'

type ThemeColors = {
  base: string
  surface: string
  overlay: string
  muted: string
  subtle: string
  text: string
  love: string
  gold: string
  rose: string
  pine: string
  foam: string
  iris: string
  highlightLow: string
  highlightMed: string
  highlightHigh: string
}

type ThemeContextValue = {
  preset: ThemePreset
  colors: ThemeColors
  customColors: CustomColors | null
  setTheme: (preset: ThemePreset, customColors?: CustomColors | null) => Promise<void>
  loading: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_PRESETS: Record<Exclude<ThemePreset, 'custom'>, ThemeColors> = {
  rose_pine_main: {
    base: '#191724',
    surface: '#1f1d2e',
    overlay: '#26233a',
    muted: '#6e6a86',
    subtle: '#908caa',
    text: '#e0def4',
    love: '#eb6f92',
    gold: '#f6c177',
    rose: '#ebbcba',
    pine: '#31748f',
    foam: '#9ccfd8',
    iris: '#c4a7e7',
    highlightLow: '#21202e',
    highlightMed: '#403d52',
    highlightHigh: '#524f67',
  },
  rose_pine_moon: {
    base: '#232136',
    surface: '#2a273f',
    overlay: '#393552',
    muted: '#6e6a86',
    subtle: '#908caa',
    text: '#e0def4',
    love: '#eb6f92',
    gold: '#f6c177',
    rose: '#ea9a97',
    pine: '#3e8fb0',
    foam: '#9ccfd8',
    iris: '#c4a7e7',
    highlightLow: '#2a283e',
    highlightMed: '#44415a',
    highlightHigh: '#56526e',
  },
  rose_pine_dawn: {
    base: '#faf4ed',
    surface: '#fffaf3',
    overlay: '#f2e9e1',
    muted: '#9893a5',
    subtle: '#797593',
    text: '#575279',
    love: '#b4637a',
    gold: '#ea9d34',
    rose: '#d7827e',
    pine: '#286983',
    foam: '#56949f',
    iris: '#907aa9',
    highlightLow: '#f4ede8',
    highlightMed: '#dfdad9',
    highlightHigh: '#cecacd',
  },
  ocean: {
    base: '#08141d',
    surface: '#0e212d',
    overlay: '#193444',
    muted: '#6e8699',
    subtle: '#c8b79d',
    text: '#f7f4ef',
    love: '#c55b5b',
    gold: '#f6c177',
    rose: '#ece4d7',
    pine: '#31748f',
    foam: '#9ccfd8',
    iris: '#c4a7e7',
    highlightLow: '#0f1f2a',
    highlightMed: '#244255',
    highlightHigh: '#2f5166',
  },
}

function applyThemeColors(colors: ThemeColors) {
  const root = document.documentElement
  root.style.setProperty('--theme-base', colors.base)
  root.style.setProperty('--theme-surface', colors.surface)
  root.style.setProperty('--theme-overlay', colors.overlay)
  root.style.setProperty('--theme-muted', colors.muted)
  root.style.setProperty('--theme-subtle', colors.subtle)
  root.style.setProperty('--theme-text', colors.text)
  root.style.setProperty('--theme-love', colors.love)
  root.style.setProperty('--theme-gold', colors.gold)
  root.style.setProperty('--theme-rose', colors.rose)
  root.style.setProperty('--theme-pine', colors.pine)
  root.style.setProperty('--theme-foam', colors.foam)
  root.style.setProperty('--theme-iris', colors.iris)
  root.style.setProperty('--theme-highlight-low', colors.highlightLow)
  root.style.setProperty('--theme-highlight-med', colors.highlightMed)
  root.style.setProperty('--theme-highlight-high', colors.highlightHigh)
  
  // Update gradient background based on theme
  const isDark = parseInt(colors.base.slice(1, 3), 16) < 128
  if (isDark) {
    root.style.background = `radial-gradient(circle at top, ${colors.overlay} 0%, ${colors.surface} 45%, ${colors.base} 100%)`
  } else {
    root.style.background = `radial-gradient(circle at top, ${colors.overlay} 0%, ${colors.surface} 45%, ${colors.base} 100%)`
  }
}

function mergeColors(preset: ThemeColors, custom: CustomColors | null): ThemeColors {
  if (!custom) return preset
  
  return {
    base: custom.base ?? preset.base,
    surface: custom.surface ?? preset.surface,
    overlay: custom.overlay ?? preset.overlay,
    muted: custom.muted ?? preset.muted,
    subtle: custom.subtle ?? preset.subtle,
    text: custom.text ?? preset.text,
    love: custom.love ?? preset.love,
    gold: custom.gold ?? preset.gold,
    rose: custom.rose ?? preset.rose,
    pine: custom.pine ?? preset.pine,
    foam: custom.foam ?? preset.foam,
    iris: custom.iris ?? preset.iris,
    highlightLow: custom.highlightLow ?? preset.highlightLow,
    highlightMed: custom.highlightMed ?? preset.highlightMed,
    highlightHigh: custom.highlightHigh ?? preset.highlightHigh,
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<ThemePreset>('rose_pine_main')
  const [customColors, setCustomColors] = useState<CustomColors | null>(null)
  const [colors, setColors] = useState<ThemeColors>(THEME_PRESETS.rose_pine_main)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await api.getSettings()
        const presetKey = settings.theme_preset as ThemePreset
        const parsedCustomColors = settings.custom_colors
          ? JSON.parse(settings.custom_colors)
          : null

        setPreset(presetKey)
        setCustomColors(parsedCustomColors)

        const baseColors = presetKey === 'custom' 
          ? THEME_PRESETS.rose_pine_main 
          : THEME_PRESETS[presetKey] ?? THEME_PRESETS.rose_pine_main
        
        const finalColors = mergeColors(baseColors, parsedCustomColors)
        setColors(finalColors)
        applyThemeColors(finalColors)
      } catch (error) {
        console.error('Failed to load theme settings:', error)
      } finally {
        setLoading(false)
      }
    }

    void loadSettings()
  }, [])

  const setTheme = async (newPreset: ThemePreset, newCustomColors?: CustomColors | null) => {
    try {
      setLoading(true)
      
      const baseColors = newPreset === 'custom'
        ? THEME_PRESETS.rose_pine_main
        : THEME_PRESETS[newPreset] ?? THEME_PRESETS.rose_pine_main
      
      const finalColors = mergeColors(baseColors, newCustomColors ?? null)
      
      await api.updateSettings({
        theme_preset: newPreset,
        custom_colors: newCustomColors ?? null,
      })

      setPreset(newPreset)
      setCustomColors(newCustomColors ?? null)
      setColors(finalColors)
      applyThemeColors(finalColors)
    } catch (error) {
      console.error('Failed to update theme:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeContext.Provider value={{ preset, colors, customColors, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export { THEME_PRESETS }
