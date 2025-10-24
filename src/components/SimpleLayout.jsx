import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

function SimpleLayout({ children }) {
  const { isDarkMode } = useTheme()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f1419' : '#fafafa'
    }}>
      <main>
        {children}
      </main>
    </div>
  )
}
export default SimpleLayout