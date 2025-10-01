'use client'

import { useState, useEffect } from 'react'
import { Type } from 'lucide-react'

type FontSize = 'small' | 'medium' | 'large'

const fontSizes = {
  small: { label: 'A', size: '12px', class: 'text-xs' },
  medium: { label: 'A', size: '16px', class: 'text-base' },
  large: { label: 'A', size: '20px', class: 'text-xl' }
}

export function FontSizeSwitcher() {
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('fontSize') as FontSize
    if (saved && fontSizes[saved]) {
      setFontSize(saved)
      applyFontSize(saved)
    }
  }, [])

  const applyFontSize = (size: FontSize) => {
    const root = document.documentElement
    
    // Setze CSS-Variable für dynamische Font-Size
    switch (size) {
      case 'small':
        root.style.fontSize = '12px'
        break
      case 'medium':
        root.style.fontSize = '16px'
        break
      case 'large':
        root.style.fontSize = '20px'
        break
    }
  }

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size)
    applyFontSize(size)
    localStorage.setItem('fontSize', size)
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
        <Type className="h-4 w-4 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative flex items-center gap-1 p-1 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl">
      {/* Glassmorphism Background Slider */}
      <div 
        className={`absolute top-1 bottom-1 w-8 rounded-lg bg-gradient-to-r from-[#0479cc] to-[#0056b3] shadow-lg transition-all duration-300 ease-out ${
          fontSize === 'small' 
            ? 'left-1' 
            : fontSize === 'medium' 
            ? 'left-[calc(33.333%+2px)]'
            : 'left-[calc(66.666%+2px)]'
        }`}
      />
      
      {/* Small */}
      <button
        onClick={() => handleFontSizeChange('small')}
        className={`relative z-10 w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center group ${
          fontSize === 'small'
            ? 'text-white'
            : 'text-[#0479cc] dark:text-[#5ba3f5] hover:text-[#0056b3] hover:scale-110 hover:bg-white/20 dark:hover:bg-white/10'
        }`}
        title="Kleine Schrift"
      >
        <span className={`text-xs font-medium transition-all duration-300 ${
          fontSize === 'small' ? '' : 'group-hover:scale-125'
        }`}>A</span>
      </button>

      {/* Medium */}
      <button
        onClick={() => handleFontSizeChange('medium')}
        className={`relative z-10 w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center group ${
          fontSize === 'medium'
            ? 'text-white'
            : 'text-[#0479cc] dark:text-[#5ba3f5] hover:text-[#0056b3] hover:scale-110 hover:bg-white/20 dark:hover:bg-white/10'
        }`}
        title="Mittlere Schrift"
      >
        <span className={`text-sm font-medium transition-all duration-300 ${
          fontSize === 'medium' ? '' : 'group-hover:scale-125'
        }`}>A</span>
      </button>

      {/* Large */}
      <button
        onClick={() => handleFontSizeChange('large')}
        className={`relative z-10 w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center group ${
          fontSize === 'large'
            ? 'text-white'
            : 'text-[#0479cc] dark:text-[#5ba3f5] hover:text-[#0056b3] hover:scale-110 hover:bg-white/20 dark:hover:bg-white/10'
        }`}
        title="Große Schrift"
      >
        <span className={`text-base font-medium transition-all duration-300 ${
          fontSize === 'large' ? '' : 'group-hover:scale-125'
        }`}>A</span>
      </button>
    </div>
  )
}

