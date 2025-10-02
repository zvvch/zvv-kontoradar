'use client'

import { Github, Heart, Sparkles } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { FontSizeSwitcher } from './FontSizeSwitcher'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 no-print">
      {/* Mobile: Controls */}
      <div className="sm:hidden px-4 py-3 flex items-center justify-center gap-3 border-b border-gray-200 dark:border-gray-700">
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

      {/* Desktop: Copyright & Info */}
      <div className="hidden sm:block px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>© {currentYear} Zürcher Verkehrsverbund (ZVV)</span>
            <span className="text-gray-400 dark:text-gray-600">|</span>
            <span className="text-xs text-orange-600 dark:text-orange-400">v0.1 Testdaten</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Developed by</span>
            <a 
              href="https://github.com/marcelrapold" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              marcelrapold
            </a>
            <span>·</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> and <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> AI
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: Copyright (simplified) */}
      <div className="sm:hidden px-4 py-3 text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>© {currentYear} ZVV</div>
          <div className="flex items-center justify-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by{' '}
            <a 
              href="https://github.com/marcelrapold" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              marcelrapold
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

