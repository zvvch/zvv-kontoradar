'use client'

import { useTheme } from '@/lib/theme'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative flex items-center gap-1 p-1 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl">
      {/* Glassmorphism Background Slider */}
      <div 
        className={`absolute top-1 bottom-1 w-8 rounded-lg bg-gradient-to-r from-[#0479cc] to-[#0056b3] shadow-lg transition-all duration-300 ease-out ${
          theme === 'light' ? 'left-1' : 'left-[calc(50%+2px)]'
        }`}
      />
      
      <button
        onClick={() => setTheme('light')}
        className={`relative z-10 w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center group ${
          theme === 'light'
            ? 'text-white'
            : 'text-[#0479cc] dark:text-[#5ba3f5] hover:text-[#0056b3] hover:scale-110 hover:bg-white/20 dark:hover:bg-white/10'
        }`}
        title="Hell"
      >
        <Sun className={`h-3.5 w-3.5 transition-all duration-300 ${
          theme === 'light' ? '' : 'group-hover:rotate-180'
        }`} />
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`relative z-10 w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center group ${
          theme === 'dark'
            ? 'text-white'
            : 'text-[#0479cc] dark:text-[#5ba3f5] hover:text-[#0056b3] hover:scale-110 hover:bg-white/20 dark:hover:bg-white/10'
        }`}
        title="Dunkel"
      >
        <Moon className={`h-3.5 w-3.5 transition-all duration-300 ${
          theme === 'dark' ? '' : 'group-hover:rotate-12'
        }`} />
      </button>
    </div>
  )
}