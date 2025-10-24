import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark')
  const [systemDark, setSystemDark] = useState(false)

  // Calculate actual dark mode state
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && systemDark)

  useEffect(() => {
    // Load theme preference from localStorage
    const savedThemeMode = localStorage.getItem('themeMode')
    if (savedThemeMode) {
      setThemeMode(savedThemeMode)
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mediaQuery.matches)

    // Listen for system theme changes
    const handleChange = (e) => setSystemDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    // Save theme mode preference to localStorage
    localStorage.setItem('themeMode', themeMode)
  }, [themeMode])

  useEffect(() => {
    // Update document class for global styling
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setThemeMode(isDarkMode ? 'light' : 'dark')
  }

  const setTheme = (mode) => {
    setThemeMode(mode)
  }

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light',
    themeMode,
    setTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}