'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function useResolvedTheme() {
  const { resolvedTheme } = useTheme()
  return resolvedTheme
}

// Automatische Tageszeit-Erkennung
function getTimeBasedTheme(): 'light' | 'dark' {
  const hour = new Date().getHours()
  // 09:00 - 17:00 = Light Mode, sonst Dark Mode
  return hour >= 9 && hour < 17 ? 'light' : 'dark'
}

// System Theme Detection
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load theme from localStorage, default to 'auto' if not set
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && savedTheme !== 'auto') {
      setTheme(savedTheme)
    } else {
      setTheme('auto')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    let resolved: 'light' | 'dark'

    switch (theme) {
      case 'light':
        resolved = 'light'
        break
      case 'dark':
        resolved = 'dark'
        break
      case 'auto':
      default:
        // Für 'auto' verwenden wir Tageszeit-basierte Erkennung
        resolved = getTimeBasedTheme()
        break
    }

    setResolvedTheme(resolved)
    localStorage.setItem('theme', theme)

    // Update document class
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)
  }, [theme, mounted])

  // Update theme every minute for auto mode
  useEffect(() => {
    if (theme !== 'auto') return

    const interval = setInterval(() => {
      const newResolved = getTimeBasedTheme()
      if (newResolved !== resolvedTheme) {
        setResolvedTheme(newResolved)
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(newResolved)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [theme, resolvedTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

