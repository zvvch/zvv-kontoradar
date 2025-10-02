'use client'

import { useState, useEffect } from 'react'
import { Github, Heart, Sparkles, ChevronUp } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { FontSizeSwitcher } from './FontSizeSwitcher'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [showControls, setShowControls] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Prüfe ob User am Ende der Seite ist (innerhalb von 100px)
      const main = document.querySelector('main')
      if (main) {
        const scrollTop = main.scrollTop
        const scrollHeight = main.scrollHeight
        const clientHeight = main.clientHeight
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight
        
        setIsNearBottom(distanceFromBottom < 100)
      }
    }

    const main = document.querySelector('main')
    if (main) {
      main.addEventListener('scroll', handleScroll)
      handleScroll() // Initial check
      
      return () => main.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 no-print">
      {/* Mobile: Compact Footer with Hidden Controls */}
      <div className="sm:hidden relative">
        {/* Hidden Controls Drawer - Slides up from bottom */}
        <div 
          className={`
            absolute bottom-full left-0 right-0 
            bg-white dark:bg-gray-800 
            border-t border-gray-200 dark:border-gray-700
            shadow-lg
            transition-all duration-300 ease-out
            ${isNearBottom || showControls 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-full opacity-0 pointer-events-none'
            }
          `}
        >
          <div className="px-4 py-3 flex items-center justify-center gap-3">
            <a 
              href="https://github.com/zvvch/zvv-kontoradar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="GitHub Repository"
            >
              <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </a>
            <FontSizeSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Main Footer Line */}
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            © {currentYear} ZVV
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle controls"
          >
            <ChevronUp 
              className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                showControls ? 'rotate-180' : ''
              }`} 
            />
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <Sparkles className="h-3 w-3 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Desktop: Copyright & Info */}
      <div className="hidden sm:block px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>© {currentYear} Zürcher Verkehrsverbund (ZVV)</span>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <span className="text-xs text-orange-600 dark:text-orange-400">v0.1 Testdaten</span>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href="https://github.com/zvvzh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1.5"
            >
              <Github className="h-4 w-4" />
              ZVV on GitHub
            </a>
            <span>·</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> and <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

